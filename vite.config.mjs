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

export default defineConfig({
  plugins: [jsxInJs(), react()],

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
    esbuild: {
      loader: { '.js': 'jsx' },
    },
  },
});
