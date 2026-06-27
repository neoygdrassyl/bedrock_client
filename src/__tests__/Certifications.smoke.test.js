/**
 * SMOKE TEST — Módulo Certificaciones (pages/user/certifications/)
 * Verifica que el módulo se importa sin error.
 */

const IMPORT_TIMEOUT = 60000;

describe('Módulo Certificaciones — Smoke', () => {
  test('certification.page.js se importa sin error', async () => {
    await expect(import('../app/pages/user/certifications/certification.page')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);
});
