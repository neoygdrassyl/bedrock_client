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


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const shouldAnalyze = env.VITE_BUILD_ANALYZE === 'true';

  return {
    plugins: [
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
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
          secure: false,
        },
      },
    },

  // Build
    build: {
      outDir: 'build',
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

          // React UI ecosystem — rsuite y react-router dependen de vendor-react-core.
          // rsuite puede acceder a internals de react, pero eso es OK porque vendor-react-core
          // ya es independiente y siempre estará inicializado antes.
            if (/react-router|rsuite|rsuite-table|styled-components|@emotion/.test(id)) return 'vendor-react';

          // PDF generation & viewing (heavy, only needed in doc views)
            if (/react-pdf|pdfjs-dist|pdf-lib|jspdf|html2canvas/.test(id)) return 'vendor-pdf';

          // Icon libraries
            if (/react-icons|lucide-react/.test(id)) return 'vendor-icons';

          // Date/time handling
            if (/moment|moment-business-days/.test(id)) return 'vendor-datetime';

          // Rich text editor
            if (/jodit/.test(id)) return 'vendor-editor';

          // Bootstrap (CSS-in-JS part) + DOMPurify
            if (/bootstrap|dompurify/.test(id)) return 'vendor-bootstrap';

          // Charts (heavy, only needed in analytics views)
            if (/recharts/.test(id)) return 'vendor-charts';

          // Alert dialogs
            if (/sweetalert2/.test(id)) return 'vendor-swal';

          // Gantt chart (frappe)
            if (/frappe-gantt/.test(id)) return 'vendor-gantt';

          // PDF viewer (separate from pdf generator)
            if (/pdf-viewer-reactjs/.test(id)) return 'vendor-pdf-viewer';

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
        'rsuite',
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
        plugins: [
          {
            // moment-business-days does `var moment = require('moment'); moment.fn.isHoliday = …`
            // esbuild's CJS interop wraps moment exports as { __esModule, default: fn },
            // so `moment.fn` is undefined.  We patch the source BEFORE esbuild
            // bundles it: remove the CJS require block and inject an ESM
            // `import moment from 'moment'` so esbuild resolves the default
            // export correctly.
            name: 'fix-moment-business-days',
            setup(build) {
              build.onLoad(
                { filter: /moment-business-days/ },
                async (args) => {
                  const { readFile } = await import('node:fs/promises');
                  let code = await readFile(args.path, 'utf8');
                  // Strip the CJS conditional require block
                  code = code.replace(
                    /if\s*\(\s*typeof\s+require\s*===\s*['"]function['"]\s*\)\s*\{[^}]*\}/,
                    '',
                  );
                  // Prepend an ESM import for moment
                  code = 'import moment from "moment";\n' + code;
                  return { contents: code, loader: 'js' };
                },
              );
            },
          },
        ],
      },
    },
  };
});
