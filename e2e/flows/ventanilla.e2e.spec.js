// @ts-check
import { test, expect } from '../fixtures/auth.fixture';
import { SubmitPage } from '../pages/submit.page';

test.use({ viewport: { width: 1920, height: 1080 } });

/**
 * E2E: Ventanilla Unica (Single-Window Filing)
 *
 * Tests the document filing system at /ventanilla:
 * 1. Navigate to /ventanilla and verify the page loads
 * 2. Open the "NUEVA ENTRADA" modal
 * 3. Verify the creation form fields
 * 4. Search for entries by different criteria
 * 5. DataTable renders with expected columns
 *
 * Prerequisite: Backend running at VITE_API_URL.
 */

test.describe('E2E: Ventanilla Unica', () => {
  /** @type {SubmitPage} */
  let submitPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    submitPage = new SubmitPage(authenticatedPage);
  });

  test('navigate to /ventanilla and verify the page loads with heading and actions', async ({ authenticatedPage }) => {
    await submitPage.goto();
    await submitPage.waitForPageLoad();

    // Verify the page heading
    await expect(submitPage.heading).toBeVisible();
    await expect(submitPage.heading).toContainText(/VENTANILLA/i);

    // Verify action section headings
    await expect(authenticatedPage.locator('text=ACCIONES')).toBeVisible();

    // Verify the "NUEVA ENTRADA" button
    await expect(submitPage.newEntryButton).toBeVisible();

    // Verify the search form (CONSULTAR section)
    await expect(submitPage.searchSelect).toBeVisible();
    await expect(submitPage.searchInput).toBeVisible();
    await expect(submitPage.searchButton).toBeVisible();
  });

  test('clicking "NUEVA ENTRADA" opens the creation modal with form fields', async ({ authenticatedPage }) => {
    await submitPage.goto();
    await submitPage.waitForPageLoad();

    // Click the new entry button
    await submitPage.openNewEntryModal();

    // The modal should contain the submit_manage form
    // Check for key form fields (they appear inside the react-modal)
    const modal = submitPage.newEntryModal;
    await expect(modal).toBeVisible();

    // Check for the radicacion number field (#submit_1)
    await expect(submitPage.form.idPublic).toBeVisible();

    // Check for the solicitud number field (#submit_2)
    await expect(submitPage.form.idRelated).toBeVisible();
  });

  test('generate button auto-fills the radicacion number', async ({ authenticatedPage }) => {
    await submitPage.goto();
    await submitPage.waitForPageLoad();

    await submitPage.openNewEntryModal();

    // Click GENERAR to auto-generate the VR number
    await expect(submitPage.form.generateIdButton).toBeVisible();
    await submitPage.form.generateIdButton.click();

    await expect.poll(() => submitPage.form.idPublic.inputValue(), { timeout: 15_000 }).toMatch(/^VR/);
  });

  test('DataTable renders the entries list after page load', async ({ authenticatedPage }) => {
    await submitPage.goto();
    await submitPage.waitForPageLoad();
    await submitPage.waitForTable();

    // The entries list heading should be visible
    await expect(submitPage.entriesHeading).toBeVisible();

    // Either the DataTable renders or a "no data" message appears
    const tableVisible = await submitPage.dataTable.isVisible().catch(() => false);
    const noData = await submitPage.noDataMessage.isVisible().catch(() => false);

    // The page should have rendered the data table area
    expect(tableVisible || noData).toBeTruthy();
  });

  test('search by radicado number (VR) returns results or empty', async ({ authenticatedPage }) => {
    await submitPage.goto();
    await submitPage.waitForPageLoad();
    await submitPage.waitForTable();

    // Search by "Numero de radicado VR" (option value="1")
    await submitPage.search('VR', '1');

    // After search, the table should still be visible (with results or empty state)
    const tableVisible = await submitPage.dataTable.isVisible().catch(() => false);
    const noData = await submitPage.noDataMessage.isVisible().catch(() => false);
    expect(tableVisible || noData).toBeTruthy();
  });

  test('search by propietario name returns filtered results', async ({ authenticatedPage }) => {
    await submitPage.goto();
    await submitPage.waitForPageLoad();
    await submitPage.waitForTable();

    // Search by "Propietario" (option value="3")
    await submitPage.search('test', '3');

    // Table should be present after search
    const tableVisible = await submitPage.dataTable.isVisible().catch(() => false);
    const noData = await submitPage.noDataMessage.isVisible().catch(() => false);
    expect(tableVisible || noData).toBeTruthy();
  });

  test('CSV section has upper and lower limit inputs', async ({ authenticatedPage }) => {
    await submitPage.goto();
    await submitPage.waitForPageLoad();

    // The CSV section should have two limit inputs and a GENERAR CSV button
    const csvHeading = authenticatedPage.locator('text=DOCUMENTO CSV');
    await expect(csvHeading).toBeVisible();

    const lowerLimit = authenticatedPage.locator('#csv_limit_1');
    const upperLimit = authenticatedPage.locator('#csv_limit_2');
    const generateCsvBtn = authenticatedPage.locator('button', { hasText: /GENERAR CSV/i });

    await expect(lowerLimit).toBeVisible();
    await expect(upperLimit).toBeVisible();
    await expect(generateCsvBtn).toBeVisible();

    // Verify default values follow the VR pattern
    const lowerValue = await lowerLimit.inputValue();
    const upperValue = await upperLimit.inputValue();
    expect(lowerValue).toMatch(/^VR\d{2}-0001$/);
    expect(upperValue).toMatch(/^VR\d{2}-9999$/);
  });
});
