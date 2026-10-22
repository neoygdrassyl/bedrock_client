/**
 * SMOKE TEST — Módulo OSHA (pages/user/osha.js)
 * Verifica que el módulo se importa sin error.
 */

const IMPORT_TIMEOUT = 60000;

describe('Módulo OSHA — Smoke', () => {
  test('osha.js se importa sin error', async () => {
    await expect(import('../features/documentos/osha')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);
});
