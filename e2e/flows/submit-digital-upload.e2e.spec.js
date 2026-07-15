// @ts-check
import { test, expect } from '../fixtures/auth.fixture';

/**
 * E2E: Digital document upload (multipart) on an existing Ventanilla entry.
 *
 * Before this spec, no e2e flow exercised a real multipart file upload —
 * every existing spec only asserts on JSON round-trips. This covers
 * SUBMIT_ANEX's "digital" panel (src/app/pages/user/submit/submit_anex.component.js),
 * reached from an existing Ventanilla (/ventanilla) entry's edit modal,
 * "Digitales" tab.
 *
 * Camino: /ventanilla -> abrir entrada existente (VR26-0001) -> pestaña
 * "Digitales" -> completar formulario + adjuntar archivo -> "GUARDAR DIGITAL"
 * -> funService.createDocumentEntriesBatch (POST /fun/documents/batch,
 * multipart/form-data) -> la lista se recarga y muestra el documento subido.
 */

const SUBMIT_ID_PUBLIC = 'VR26-0001';
const UPLOADED_DOC_DESCRIPTION = 'Anexo de prueba E2E';
const UPLOADED_DOC_CODE = 'DOC-E2E-001';

/** @param {import('@playwright/test').Page} page */
async function installDigitalUploadMocks(page) {
  /** @type {Array<Record<string, unknown>>} */
  let digitalDocs = [];
  let batchRequestContentType = '';
  let batchCalled = false;

  await page.route('**/fun/documents/vr-digital/**', async (route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(digitalDocs),
    });
  });

  await page.route('**/fun/documents/batch', async (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    batchCalled = true;
    batchRequestContentType = route.request().headers()['content-type'] || '';
    digitalDocs = [
      ...digitalDocs,
      {
        id: 5001,
        description: UPLOADED_DOC_DESCRIPTION,
        id_public: UPLOADED_DOC_CODE,
        pages: 3,
        medio_recepcion: 'CORREO_ELECTRONICO',
        date: '2026-03-10',
        path: 'docs/fun',
        filename: 'anexo-e2e.pdf',
      },
    ];
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'OK' }) });
  });

  return {
    wasBatchCalled: () => batchCalled,
    getBatchContentType: () => batchRequestContentType,
  };
}

test.describe('E2E: Ventanilla — subida de documento digital (multipart)', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test('adjuntar un documento digital sube el archivo (multipart) y la lista lo refleja', async ({ authenticatedPage: page }) => {
    const mocks = await installDigitalUploadMocks(page);

    await page.goto('/ventanilla');
    await page.waitForLoadState('domcontentloaded');

    const row = page.locator('.rdt_TableRow', { hasText: SUBMIT_ID_PUBLIC }).first();
    await expect(row).toBeVisible({ timeout: 15000 });
    await row.locator('button[title="Abrir"]').click();

    const modal = page.locator('.ReactModal__Content').filter({ has: page.locator('#submit_1') }).last();
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Switch to the "Digitales" tab to reveal SUBMIT_ANEX's digital-upload panel.
    await page.locator('button', { hasText: 'Digitales' }).first().click();

    // The panel starts collapsed (digitalFormOpen=false) — expand it first.
    await page.locator('button', { hasText: /AGREGAR DIGITAL/i }).click();

    await expect(page.locator('#submit_digital_doc_code_input')).toBeVisible({ timeout: 10000 });
    await page.locator('#submit_digital_doc_code_input').fill(UPLOADED_DOC_CODE);
    await page.locator('#submit_digital_doc_description').fill(UPLOADED_DOC_DESCRIPTION);
    await page.locator('#submit_digital_doc_file').setInputFiles({
      name: 'anexo-e2e.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 e2e test fixture content', 'utf-8'),
    });
    await page.locator('#submit_digital_doc_pages').fill('3');
    // Origin defaults to "Medio digital", which requires a reception medium.
    await page.locator('#submit_digital_doc_medium').selectOption('CORREO_ELECTRONICO');

    await page.locator('button', { hasText: /GUARDAR DIGITAL/i }).click();

    // Success feedback + list refresh (round-trip confirmation).
    await expect(page.locator('.swal2-popup', { hasText: /Documento digital creado/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(UPLOADED_DOC_DESCRIPTION)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(UPLOADED_DOC_CODE)).toBeVisible();

    expect(mocks.wasBatchCalled()).toBe(true);
    expect(mocks.getBatchContentType()).toContain('multipart/form-data');
  });
});
