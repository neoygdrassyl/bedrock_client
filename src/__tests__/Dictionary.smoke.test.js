/**
 * SMOKE TEST — Módulo Diccionario (pages/user/dictionary.page.js)
 * Verifica que el módulo se importa sin error.
 */

const IMPORT_TIMEOUT = 60000;

describe('Módulo Diccionario — Smoke', () => {
  test('dictionary.page.js se importa sin error', async () => {
    await expect(import('../app/pages/user/dictionary.page')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);
});
