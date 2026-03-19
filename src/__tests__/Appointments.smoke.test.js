/**
 * SMOKE TEST — Módulo Citas (pages/user/appointments.js)
 * Verifica que el módulo se importa sin error.
 */

const IMPORT_TIMEOUT = 60000;

describe('Módulo Citas (Appointments) — Smoke', () => {
  test('appointments.js se importa sin error', async () => {
    await expect(import('../app/pages/user/appointments')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);
});
