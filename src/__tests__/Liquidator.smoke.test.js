/**
 * SMOKE TEST — Módulo Liquidador (pages/liquidator/liquidator.js)
 * Verifica que el módulo se importa sin error.
 */

const IMPORT_TIMEOUT = 60000;

describe('Módulo Liquidador — Smoke', () => {
  test('liquidator.js se importa sin error', async () => {
    await expect(import('../app/pages/liquidator/liquidator')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);
});
