/**
 * SMOKE TEST — Módulo Normas (pages/user/norms/)
 * Verifica que todos los archivos del módulo se importan sin error.
 */

const IMPORT_TIMEOUT = 60000;

describe('Módulo Normas — Smoke', () => {
  test('norms.page.js se importa sin error', async () => {
    await expect(import('../app/pages/user/norms/norms.page')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('norm.vars.js se importa sin error', async () => {
    await expect(import('../app/pages/user/norms/norm.vars')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('norm_element.component.js se importa sin error', async () => {
    await expect(import('../app/pages/user/norms/norm_element.component')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('norm_geeral.component.js se importa sin error', async () => {
    await expect(import('../app/pages/user/norms/norm_geeral.component')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('norm_neighbors.component.js se importa sin error', async () => {
    await expect(import('../app/pages/user/norms/norm_neighbors.component')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('norm_perfil.component.js se importa sin error', async () => {
    await expect(import('../app/pages/user/norms/norm_perfil.component')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('norm_predio.component.js se importa sin error', async () => {
    await expect(import('../app/pages/user/norms/norm_predio.component')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('norm_resume.component.js se importa sin error', async () => {
    await expect(import('../app/pages/user/norms/norm_resume.component')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);
});
