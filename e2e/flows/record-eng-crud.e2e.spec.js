// @ts-check
import { test, expect, installE2EMocks } from '../fixtures/auth.fixture';
import { FunPage } from '../pages/fun.page';

/**
 * E2E: RECORD_ENG (Informe Estructural) — create + read + update.
 *
 * Before this spec, record_eng had zero e2e coverage. record_arc and
 * record_ph already have e2e guards (subdivision-qgis-approve-reject,
 * ph-report / ph-report-workspace), so this fills the remaining gap for the
 * "one representative record type" item of Fase 3.
 *
 * Camino: /licencias -> buscar expediente -> "Inf. Estructural" (abre
 * workspace en pestaña nueva, mismo patrón que subdivision-qgis-approve-reject
 * y ph-report-workspace) -> generar informe en blanco (create) -> el panel
 * recién creado se lee de vuelta (read) -> seleccionar categoría (update).
 *
 * Usa el expediente id_public '68001-1-26-0002' (Propietario Expedicion),
 * distinto del usado por el flujo de subdivisión (...-0003) y el de P.H.
 * (...-0001), para no pisar los mocks/estado de esos specs.
 */

const FUN_ID_PUBLIC = '68001-1-26-0002';
const RECORD_ENG_ID = 9101;

/** @param {import('@playwright/test').Page} page */
async function installRecordEngMocks(page) {
  /** @type {null | { id: number, fun0Id: number, version: number, category: number | null, subcategory: string }} */
  let record = null;

  await page.route('**/recordeng/findIdRelated/**', async (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(record ? [record] : []),
    });
  });

  await page.route('**/recordeng', async (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    record = {
      id: RECORD_ENG_ID,
      fun0Id: 2,
      version: 1,
      category: null,
      subcategory: '',
      // Every array the eng/* subcomponents dereference — real backend
      // responses always include these; the mock must too or the category
      // == 1 branch (which renders record_eng_desc + several eng/* steps)
      // crashes trying to read .length/[index] off undefined.
      record_eng_steps: [],
      record_eng_reviews: [],
      record_eng_sismics: [],
      record_law_steps: [],
    };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify('OK') });
  });

  await page.route(`**/recordeng/${RECORD_ENG_ID}`, async (route) => {
    if (route.request().method() !== 'PUT') return route.fallback();
    // This spec only ever selects the "ESTUDIO" (category=1) option, so the
    // mock hardcodes that outcome instead of parsing the multipart body.
    if (record) {
      record = { ...record, category: 1 };
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify('OK') });
  });

  // selectCategory() also PUTs the parent fun record's `rules` field.
  await page.route('**/fun/2', async (route) => {
    if (route.request().method() !== 'PUT') return route.fallback();
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify('OK') });
  });
}

test.describe('E2E: RECORD_ENG — Informe Estructural', () => {
  /** @type {FunPage} */
  let funPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    funPage = new FunPage(authenticatedPage);
    await authenticatedPage.setViewportSize({ width: 1920, height: 1080 });
    authenticatedPage.on('pageerror', (error) => {
      console.error('PAGE ERROR:', error.message);
    });
  });

  test('generar informe en blanco (create), releer el registro (read) y fijar categoría (update)', async ({ authenticatedPage }) => {
    await funPage.goto();
    await authenticatedPage.waitForLoadState('domcontentloaded');
    await funPage.search(FUN_ID_PUBLIC);

    const row = authenticatedPage.locator('.rdt_TableRow', { hasText: FUN_ID_PUBLIC }).first();
    await expect(row).toBeVisible({ timeout: 15000 });
    await row.locator('.fun-action-toggle').click();

    const workspacePromise = authenticatedPage.context().waitForEvent('page');
    await authenticatedPage.locator('.fun-action-menu [role="menuitem"]', { hasText: /Inf\. Estructural/i }).click();
    const workspacePage = await workspacePromise;

    // page.route() doesn't propagate to windows opened via window.open —
    // reinstall the shared mocks + this spec's record_eng mocks there too
    // (same requirement documented in subdivision-qgis-approve-reject).
    await installE2EMocks(workspacePage);
    await installRecordEngMocks(workspacePage);

    await workspacePage.waitForLoadState('domcontentloaded');
    await expect(workspacePage).toHaveURL(/\/funmanage\/expediente\/.+report=estructural/);

    // CREATE: no record_eng exists yet for this expediente -> blank-report CTA.
    const generateButton = workspacePage.locator('button', { hasText: /Generar informe en blanco/i });
    await expect(generateButton).toBeVisible({ timeout: 15000 });
    await generateButton.click();

    // READ: after create, the component re-fetches via findIdRelated and
    // renders the category selector — proof the newly created record was
    // read back, not just optimistically assumed.
    const categorySelect = workspacePage.locator('#r_e_select_category');
    await expect(categorySelect).toBeVisible({ timeout: 15000 });
    await expect(categorySelect).toHaveValue('0');

    // UPDATE: select "ESTUDIO" (category=1) — triggers RECORD_ENG_SERVICE.update.
    await categorySelect.selectOption('1');

    // The panel title reflects the persisted category after the PUT + refetch
    // (title[currentRecord.category] in record_eng.js). Scoped to the
    // section legend, not the <option> text inside the (closed) select.
    await expect(workspacePage.locator('legend.text-center label', { hasText: /^ESTUDIO$/ })).toBeVisible({ timeout: 10000 });
    await expect(workspacePage.locator('[role="alert"]')).toHaveCount(0);

    await workspacePage.close();
  });
});
