/**
 * SMOKE TEST — Módulo Publish (pages/user/publish.js)
 * Verifica que el módulo se importa sin error.
 */

const IMPORT_TIMEOUT = 60000;

describe('Módulo Publish — Smoke', () => {
  test('publish.js se importa sin error', async () => {
    await expect(import('../features/publications/publish')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);
});
