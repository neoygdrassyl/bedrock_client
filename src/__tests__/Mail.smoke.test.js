/**
 * SMOKE TEST — Módulo Correo (pages/user/mail.js)
 * Verifica que el módulo se importa sin error.
 */

const IMPORT_TIMEOUT = 60000;

describe('Módulo Correo (Mail) — Smoke', () => {
  test('mail.js se importa sin error', async () => {
    await expect(import('../app/pages/user/mail')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);
});
