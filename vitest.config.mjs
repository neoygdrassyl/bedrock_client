import { defineConfig } from 'vitest/config';
import { transformWithEsbuild } from 'vite';
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

// Custom plugin: mock all CSS/SCSS/LESS imports to empty modules in tests
function cssNoop() {
  const styleMockPath = new URL('./src/__mocks__/styleMock.js', import.meta.url).pathname;
  return {
    name: 'css-noop',
    enforce: 'pre',
    resolveId(source) {
      if (/\.(css|scss|sass|less)(\?.*)?$/.test(source)) {
        return styleMockPath;
      }
    },
  };
}

export default defineConfig({
  plugins: [cssNoop(), jsxInJs(), react()],

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.js'],

    css: false,

    // Exclude Playwright E2E tests — they run via `npx playwright test`
    exclude: ['e2e/**', 'node_modules/**'],

    // Transform ESM packages (same as CRA's transformIgnorePatterns)
    deps: {
      optimizer: {
        web: {
          include: ['rsuite', '@babel/runtime', 'react-data-table-component'],
        },
      },
    },
  },
});
