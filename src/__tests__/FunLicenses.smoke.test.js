/**
 * SMOKE TESTS — Módulo Licencias (FUN) y sus sub-módulos
 *
 * Verifica que todos los componentes del módulo de radicación de licencias
 * se importan sin error. Esto detecta problemas de compatibilidad con
 * react-data-table-component v7, styled-components v6, y React 18.
 *
 * Estructura del módulo FUN:
 *   fun.js → Contenedor principal con DataTable + modales
 *     ├── fun_c.js (Creación)
 *     ├── fun_g.js (Gestión general + checklist)
 *     ├── fun_n.js → fun_n_1..fun_n_53 (Formularios normativos)
 *     ├── fun_docs.js (Documentos asociados)
 *     ├── fun_clock.js (Relojes de la licencia)
 *     ├── fun_alertn.js (Alertas de colindantes)
 *     ├── fun_macrotable..js (Tabla macro de licencias)
 *     └── components/ (Sub-componentes: reportes, asignación, etc.)
 */

const IMPORT_TIMEOUT = 60000;

// ─── FUN principal + Formularios de creación ─────────────────────────────────

describe('Módulo Licencias (FUN) — Importación principal', () => {

  test('fun.js (contenedor principal) se importa sin error', async () => {
    await expect(import('../app/pages/user/fun')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_c.js (creación de licencia) se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/fun_c')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_g.js (gestión general) se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/fun_g')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_clock.js (relojes de licencia) se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/fun_clock')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_alertn.js (alertas colindantes) se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/fun_alertn')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_macrotable..js (tabla macro) se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/fun_macrotable.')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);
});

// ─── Formularios normativos (fun_n family) ───────────────────────────────────

describe('Módulo Licencias — Formularios normativos (N)', () => {

  test('fun_n.js (contenedor normas) se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/fun_n')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_n_1.js se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/fun_n_1')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_n_2.js se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/fun_n_2')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_n_3.js se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/fun_n_3')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_n_4.js se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/fun_n_4')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_n_51.js se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/fun_n_51')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_n_52.js se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/fun_n_52')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_n_53.js se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/fun_n_53')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);
});

// ─── Componentes internos del módulo de licencias ────────────────────────────

describe('Módulo Licencias — Componentes internos (components/)', () => {

  test('fun_docs.js (documentos) se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/components/fun_docs')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_report_data_edit.js se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/components/fun_report_data_edit')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_doc_confirminc.js se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/components/fun_doc_confirminc')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_doc_confirmlegal.js se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/components/fun_doc_confirmlegal')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_doc_certification.component.js se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/components/fun_doc_certification.component')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_doc_abdicate.component.js se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/components/fun_doc_abdicate.component')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_worker_asign.component.js se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/components/fun_worker_asign.component')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_asign.component.js se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/components/fun_asign.component')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_archive.component.js se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/components/fun_archive.component')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_3_g_view.js (DataTable con selectors) se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/components/fun_3_g_view')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_clocks_negative.component.js se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/components/fun_clocks_negative.component')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_macro_clocks.compnent.js se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/components/fun_macro_clocks.compnent')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_g_checklist.js se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/fun_g_checklist')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_6.view.js (vista de documentos 6) se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/fun_6.view')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);
});

// ─── Módulo de ventanilla (Submit) usado dentro de licencias ─────────────────

describe('Módulo Licencias — Submit (ventanilla única)', () => {

  test('submit_view.component.js (DataTable) se importa sin error', async () => {
    await expect(import('../app/pages/user/submit/submit_view.component')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('submit_x_fun.component.js se importa sin error', async () => {
    await expect(import('../app/pages/user/submit/submit_x_fun.component')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('submit.js (listado ventanilla) se importa sin error', async () => {
    await expect(import('../app/pages/user/submit/submit')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('submit_anex.component.js se importa sin error', async () => {
    await expect(import('../app/pages/user/submit/submit_anex.component')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);
});

// ─── Reportes de licencias ───────────────────────────────────────────────────

describe('Módulo Licencias — Reportes', () => {

  test('fun_report_data.js se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/components/fun_report_data')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_g_reports.component.js se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/components/fun_g_reports.component')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);

  test('fun_g_reportMaster.compoentn.js se importa sin error', async () => {
    await expect(import('../app/pages/user/fun_forms/components/fun_g_reportMaster.compoentn')).resolves.toBeTruthy();
  }, IMPORT_TIMEOUT);
});
