import { defineConfig, loadEnv, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// Custom plugin: treat .js files in src/ as JSX (CRA migration compat)
function jsxInJs() {
  return {
    name: 'jsx-in-js',
    enforce: 'pre',
    async transform(code, id) {
      if (!/src\/.*\.js$/.test(id)) return null;
      return transformWithEsbuild(code, id, {
        loader: 'jsx',
        jsx: 'automatic',
      });
    },
  };
}

/**
 * Custom plugin: convert CJS require() calls in src/ files to ESM imports.
 *
 * CRA's webpack bundler provided a `require` shim so inline require() worked
 * everywhere. Vite serves source files as native ESM to the browser, where
 * `require` is not defined, causing ReferenceError.
 *
 * Strategy:
 *  1. Collect all `const/let/var X = require('mod')` occurrences (skip comments).
 *  2. Detect which modules already have a top-level `import … from 'mod'`.
 *  3. Add missing `import X from 'mod'` statements at the top.
 *  4. Remove each require() line — the function-scoped var falls through to
 *     the module-scoped import.
 */
function cjsToEsm() {
  // Pattern: const/let/var <id> = require('<specifier>');
  const REQ_RE =
    /^(\s*)(?:const|let|var)\s+(\w+)\s*=\s*require\(\s*(['"])([^'"]+)\3\s*\);?/gm;

  return {
    name: 'cjs-to-esm',
    enforce: 'pre',
    transform(code, id) {
      // Only touch project source files
      if (id.includes('node_modules') || !/src\/.*\.js$/.test(id)) return null;
      if (!code.includes('require(')) return null;

      // 1. Detect existing top-level ESM imports  →  Set<specifier>
      const alreadyImported = new Set();
      const IMPORT_RE = /^import\s+.*?\s+from\s+['"]([^'"]+)['"]/gm;
      for (const match of code.matchAll(IMPORT_RE)) {
        alreadyImported.add(match[1]);
      }

      // 2. Walk require() matches — collect new imports & build replacement code
      const newImports = new Map(); // specifier → varName (first wins)
      const transformed = code.replace(REQ_RE, (match, indent, varName, _q, specifier) => {
        // Skip commented lines
        const lineStart = match.trimStart();
        if (lineStart.startsWith('//') || lineStart.startsWith('/*')) return match;

        // Track the import (first variable name wins for de-dup)
        if (!alreadyImported.has(specifier) && !newImports.has(specifier)) {
          newImports.set(specifier, varName);
        }

        // Remove the require line (variable now resolves to module-scope import)
        return '';
      });

      if (newImports.size === 0 && transformed === code) return null;

      // 3. Prepend new import statements
      let header = '';
      for (const [specifier, varName] of newImports) {
        // JSON imports use default export in Vite
        header += `import ${varName} from '${specifier}';\n`;
      }

      return { code: header + transformed, map: null };
    },
  };
}


export function resolveRuntime(env, command = 'serve') {
  const urls = {};
  const relativeApi = /^\/(?![\/\\])/.test(env.VITE_API_URL || '') && !env.VITE_API_URL.includes('\\');
  for (const [name, value] of Object.entries({
    VITE_APP_URL: env.VITE_APP_URL === undefined ? 'http://localhost:3000' : env.VITE_APP_URL,
    VITE_API_URL: env.VITE_API_URL,
  })) {
    try {
      const url = name === 'VITE_API_URL' && relativeApi ? new URL(value, 'http://vite.local') : new URL(value);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.port === '0') throw new Error();
      if (name === 'VITE_APP_URL' && url.pathname !== '/') throw new Error();
      urls[name] = url;
    } catch {
      throw new Error(`${name} must be an HTTP(S) URL without credentials, query or fragment; VITE_APP_URL must be an origin and VITE_API_URL also accepts a root-relative path such as /api.`);
    }
  }
  const port = Number(urls.VITE_APP_URL.port || (urls.VITE_APP_URL.protocol === 'https:' ? 443 : 80));
  const api = urls.VITE_API_URL;
  let proxy;
  if (relativeApi && command === 'serve') {
    let target;
    try {
      target = new URL(env.BACKOFFICE_GATE_URL);
      if (!['http:', 'https:'].includes(target.protocol) || target.username || target.password || target.search || target.hash || target.pathname !== '/' || target.port === '0') throw new Error();
    } catch {
      throw new Error('BACKOFFICE_GATE_URL must be an absolute HTTP(S) origin without credentials, path, query or fragment when Vite proxies a relative VITE_API_URL.');
    }
    proxy = { [api.pathname.replace(/\/+$/, '') || '/']: { target: target.origin, changeOrigin: true } };
  }
  return {
    port,
    proxy,
  };
}

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const runtime = resolveRuntime(env, command);
  // `npm run build:analyze` keeps `--mode production` (so `.env.production` is
  // still loaded) and is detected through npm's cross-platform lifecycle name.
  // `VITE_BUILD_ANALYZE=true` in an env file or the shell still works too.
  const shouldAnalyze = env.VITE_BUILD_ANALYZE === 'true' || process.env.npm_lifecycle_event === 'build:analyze';
  // Extra hosts allowed by the dev/preview server (e.g. temporary Cloudflare tunnels).
  // Comma-separated, e.g. VITE_ALLOWED_HOSTS="a.trycloudflare.com,b.trycloudflare.com"
  const allowedHosts = (env.VITE_ALLOWED_HOSTS || '')
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean);

  return {
    plugins: [
      {
        name: 'application-port',
        configResolved(config) {
          if (config.server.port !== runtime.port || config.preview.port !== runtime.port || !config.server.strictPort || !config.preview.strictPort) {
            throw new Error('Set VITE_APP_URL instead of overriding the server/preview port or strictPort.');
          }
        },
      },
      cjsToEsm(),
      jsxInJs(),
      react(),
      shouldAnalyze && visualizer({
        filename: 'build/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),

  // Treat .md files as static assets (CRA imported them as URLs for fetch())
    assetsInclude: ['**/*.md'],

  // Dev server
    server: {
      port: runtime.port,
      strictPort: true,
      open: true,
      proxy: runtime.proxy,
      allowedHosts,
    },
    preview: { port: runtime.port, strictPort: true, proxy: runtime.proxy, allowedHosts },

  // Build
    build: {
      outDir: 'build',
      emptyOutDir: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;

          // React core runtime — aislado en su propio chunk sin dependencias externas.
          // CRÍTICO: evita "can't access property 'createContext' of undefined" que ocurre
          // cuando vendor-pdf (react-pdf) se ejecuta antes de que vendor-react termine de
          // inicializarse. Al separar react/react-dom/scheduler aquí, Rollup garantiza que
          // este chunk cargue primero y esté listo para cualquier otro chunk que lo necesite.
            if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'vendor-react-core';

          // React UI ecosystem — react-router depende de vendor-react-core.
            if (/react-router/.test(id)) return 'vendor-react';

          // PDF generation & viewing (heavy, only needed in doc views)
            if (/react-pdf|pdfjs-dist|pdf-lib|jspdf|html2canvas/.test(id)) return 'vendor-pdf';

          // Icon libraries
            if (/react-icons|lucide-react/.test(id)) return 'vendor-icons';

          // Rich text editor
            if (/jodit/.test(id)) return 'vendor-editor';

          // Bootstrap (CSS-in-JS part) + DOMPurify
            if (/bootstrap|dompurify/.test(id)) return 'vendor-bootstrap';

          // Charts (heavy, only needed in analytics views)
            if (/recharts/.test(id)) return 'vendor-charts';

          // Alert dialogs
            if (/sweetalert2/.test(id)) return 'vendor-swal';

          // Spreadsheet
            if (/react-spreadsheet/.test(id)) return 'vendor-spreadsheet';
          },
        },
      },
    },

  // Resolve
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
      alias: {
        // Alias '@' → 'src/' for shadcn/ui component imports
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },

  // Ensure public/ static files are served (templates, etc.)
    publicDir: 'public',

  // Pre-bundle optimization — handle JSX in .js for node_modules too
    optimizeDeps: {
      include: [
        '@tanstack/react-table',
        'react-pdf',
        'pdf-lib',
        'markdown-to-jsx',
        'next-themes',
        'sonner',
        'clsx',
        'tailwind-merge',
        'class-variance-authority',
        '@radix-ui/react-scroll-area',
        '@radix-ui/react-tooltip',
        '@radix-ui/react-slot',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-avatar',
        '@radix-ui/react-separator',
        'axios',
        'js-sha256',
      ],
      esbuildOptions: {
        loader: { '.js': 'jsx' },
      },
    },
  };
});
