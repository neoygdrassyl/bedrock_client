// @ts-check
import { defineConfig, devices } from '@playwright/test';
import { PLAYWRIGHT_TMP } from './src/__playwright/config.js';

/**
 * Playwright E2E configuration for Dovela Frontend.
 *
 * Docs: https://playwright.dev/docs/test-configuration
 *
 * Strategy:
 * - Tests run against the Vite dev server on :3000
 * - Auth is handled by token injection (bypasses ReCAPTCHA)
 * - Backend must be running at the URL defined in .env (VITE_API_URL)
 * - Screenshots captured on failure, traces on first retry
 * - All artifacts stored in centralized temp directory (see src/__playwright/config.js)
 */
export default defineConfig({
  testDir: './e2e/flows',

  /* Maximum time a single test can run */
  timeout: 90_000,

  /* Maximum time expect() assertions can take */
  expect: {
    timeout: 15_000,
  },

  /* Fail the build on CI if test.only is left in source */
  forbidOnly: !!process.env.CI,

  /* Retry once on failure to reduce flakiness */
  retries: 1,

  /* Forzar un único worker siempre para evitar colisiones con Vitest o el entorno */
  workers: 1,

  /* Reporter */
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['list']]
    : [['list']],

  /* Shared settings for all projects */
  use: {
    baseURL: 'http://localhost:3000',

    /* Desactivar cualquier captura visual para evitar consumir tokens multimodales pesados */
    screenshot: 'off',
    trace: 'off',
    video: 'off',
    
    /* Configurar resolución forzada de pantalla completa / 16:9 ideal para la UI de Dovela */
    viewport: { width: 1920, height: 1080 },

    /* Reasonable navigation timeout */
    navigationTimeout: 30_000,

    /* Allow slower first-load interactions on cold startup */
    actionTimeout: 15_000,

    /* Locale matching the app default */
    locale: 'es-CO',
  },

  /* Browser projects — Chromium only for now */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }, // Sobreescribimos el viewport predeterminado de Desktop Chrome
      },
    },
  ],

  /* Start Vite dev server before tests if not already running */
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },

  /* Output directory for test artifacts (screenshots, traces, videos) */
  outputDir: PLAYWRIGHT_TMP,

  /**
   * Global setup: Initialize Playwright temp directory before tests run.
   */
  globalSetup: './e2e/global-setup.js',

  /**
   * Global teardown: Clean up Playwright temp directory after tests complete.
   * Removes all screenshots, traces, videos, etc. to avoid leaving "mugre" behind.
   */
  globalTeardown: './e2e/global-teardown.js',
});
