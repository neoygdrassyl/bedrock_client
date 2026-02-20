import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';

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
      let m;
      while ((m = IMPORT_RE.exec(code)) !== null) {
        alreadyImported.add(m[1]);
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

/**
 * Vite plugin: patch mdb-react-ui-kit for React 19 during PRODUCTION builds.
 *
 * mdb-react-ui-kit 1.6.0 uses `defaultProps` on forwardRef components. React 19
 * silently ignores `defaultProps` on function/forwardRef components, meaning the
 * `tag` prop (and others) resolve to `undefined` → crash.
 *
 * This plugin intercepts the MDB source during Rollup (production) bundling and
 * appends a patch that wraps each component's `.render` to merge `defaultProps`
 * into incoming props.
 *
 * (The dev server is handled by the esbuild plugin in `optimizeDeps`.)
 */
function fixMdbDefaultProps() {
  return {
    name: 'fix-mdb-defaultprops',
    enforce: 'pre',
    transform(code, id) {
      // Only patch files that contain mdb-react-ui-kit
      if (!id.includes('mdb-react-ui-kit')) return null;
      if (!code.includes('.defaultProps')) return null;

      // Inline-patch each `.defaultProps = {...}` assignment.
      // Right after the assignment, call a self-invoking function that
      // wraps Component.render to merge defaults into props.
      // This survives Rollup tree-shaking because each patch references
      // a variable that is later exported.
      const DP_RE = /(\w+)(\.defaultProps\s*=\s*\{[^}]+\})/g;
      let patched = false;
      const newCode = code.replace(DP_RE, (match, varName, rest) => {
        patched = true;
        return match + `;(function(__c){if(__c&&__c.defaultProps&&typeof __c.render==='function'){var __dp=__c.defaultProps,__orig=__c.render;__c.render=function(__p,__r){var __m={};for(var __k in __dp)__m[__k]=__dp[__k];if(__p)for(var __k2 in __p){if(__p[__k2]!==void 0)__m[__k2]=__p[__k2];}return __orig(__m,__r);}}})(${varName})`;
      });

      if (!patched) return null;
      return { code: newCode, map: null };
    },
  };
}

export default defineConfig({
  plugins: [cjsToEsm(), jsxInJs(), fixMdbDefaultProps(), react()],

  // Treat .md files as static assets (CRA imported them as URLs for fetch())
  assetsInclude: ['**/*.md'],

  // Dev server
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Build
  build: {
    outDir: 'build',
    sourcemap: true,
  },

  // Resolve
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },

  // Ensure public/ static files are served (templates, etc.)
  publicDir: 'public',

  // Pre-bundle optimization — handle JSX in .js for node_modules too
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
      plugins: [
        {
          // mdb-react-ui-kit 1.6.0 uses `defaultProps` on forwardRef components
          // (e.g. `MDBCard.defaultProps = {tag: "div"}`).  React 19 silently
          // ignores `defaultProps` on function/forwardRef components, so `tag`
          // becomes `undefined` at runtime → "Element type is invalid" crash.
          //
          // Fix: after the library code, patch every forwardRef component that
          // has `defaultProps` so its `.render` function merges the defaults
          // into incoming props — this restores the React 18 behavior at the
          // library level without touching React internals.
          name: 'fix-mdb-defaultprops',
          setup(build) {
            build.onLoad(
              { filter: /mdb-react-ui-kit[\\/]dist[\\/]mdb-react-ui-kit\.esm\.js$/ },
              async (args) => {
                const { readFile } = await import('node:fs/promises');
                let code = await readFile(args.path, 'utf8');

                // Inline-patch: after each `.defaultProps = {...}`, insert a
                // self-invoking function that wraps .render to merge defaults.
                const DP_RE = /(\w+)(\.defaultProps\s*=\s*\{[^}]+\})/g;
                let patched = false;
                code = code.replace(DP_RE, (match, varName) => {
                  patched = true;
                  return match + `;(function(__c){if(__c&&__c.defaultProps&&typeof __c.render==='function'){var __dp=__c.defaultProps,__orig=__c.render;__c.render=function(__p,__r){var __m={};for(var __k in __dp)__m[__k]=__dp[__k];if(__p)for(var __k2 in __p){if(__p[__k2]!==void 0)__m[__k2]=__p[__k2];}return __orig(__m,__r);}}})(${varName})`;
                });

                return { contents: code, loader: 'js' };
              },
            );
          },
        },
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
});
