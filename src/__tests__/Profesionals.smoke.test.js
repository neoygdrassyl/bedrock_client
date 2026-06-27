/**
 * SMOKE TEST — Módulo Profesionales (pages/user/profesionals/)
 * Verifica que todos los archivos del módulo se importan sin error.
 */

const IMPORT_TIMEOUT = 60000;

describe('Módulo Profesionales — Smoke', () => {
  test('profesionals.page.js se importa sin error', async () => {
    await expect(import('../app/pages/user/profesionals/profesionals.page')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('email.page.js se importa sin error', async () => {
    await expect(import('../app/pages/user/profesionals/email.page')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('manage.component.js se importa sin error', async () => {
    await expect(import('../app/pages/user/profesionals/manage.component')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('public.page.js se importa sin error', async () => {
    await expect(import('../app/pages/user/profesionals/public.page')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);
});
