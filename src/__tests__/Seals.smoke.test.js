/**
 * SMOKE TEST — Módulo Sellos (pages/user/seal.js)
 * Verifica que el módulo se importa sin error.
 */

const IMPORT_TIMEOUT = 60000;

describe('Módulo Sellos — Smoke', () => {
  test('seal.js se importa sin error', async () => {
    await expect(import('../app/pages/user/seal')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);
});
