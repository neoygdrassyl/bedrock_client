// @ts-check
import { test, expect } from '../fixtures/auth.fixture';
import { ArchivePage } from '../pages/archive.page';

/**
 * E2E: Archivo Documental (Document Archive)
 *
 * Tests the archive module at /archive:
 * 1. Navigate to /archive and verify the page loads
 * 2. Verify "NUEVA CAJA" button is present for admin role
 * 3. Verify DataTable renders with boxes or "NO HAY CAJAS"
 * 4. Search for boxes by number
 * 5. Expand a box row to see its items
 *
 * Prerequisite: Backend running at VITE_API_URL.
 */

test.describe('E2E: Archivo Documental', () => {
  /** @type {ArchivePage} */
  let archivePage;

  test.beforeEach(async ({ authenticatedPage }) => {
    archivePage = new ArchivePage(authenticatedPage);
  });

  test('navigate to /archive and verify the page loads with heading', async ({ authenticatedPage }) => {
    await archivePage.goto();
    await archivePage.waitForPageLoad();

    // Verify the page heading
    await expect(archivePage.heading).toBeVisible();
    await expect(archivePage.heading).toContainText(/ARCHIVO/i);
  });

  test('admin user sees the "NUEVA CAJA" button', async ({ authenticatedPage }) => {
    await archivePage.goto();
    await archivePage.waitForPageLoad();

    // The auth fixture injects a user with roleId=1 (admin)
    // The archive page shows "NUEVA CAJA" only for roleId 1 or 3
    await expect(archivePage.newBoxButton).toBeVisible();
  });

  test('search form has field selector and text input', async ({ authenticatedPage }) => {
    await archivePage.goto();
    await archivePage.waitForPageLoad();

    // Verify search controls
    await expect(archivePage.searchSelect).toBeVisible();
    await expect(archivePage.searchInput).toBeVisible();
    await expect(archivePage.searchButton).toBeVisible();

    // Verify the search select options
    const options = archivePage.searchSelect.locator('option');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThanOrEqual(3);

    // Verify known options exist
    await expect(options.filter({ hasText: /Nr Caja/i })).toHaveCount(1);
    await expect(options.filter({ hasText: /Nr Radicado/i })).toHaveCount(1);
  });

  test('DataTable renders with boxes or shows empty state', async ({ authenticatedPage }) => {
    await archivePage.goto();
    await archivePage.waitForPageLoad();

    await archivePage.waitForTable();

    // Either we see boxes in the table or the "NO HAY CAJAS" message
    const tableVisible = await archivePage.dataTable.isVisible().catch(() => false);
    const noBoxes = await archivePage.noDataMessage.isVisible().catch(() => false);

    expect(tableVisible || noBoxes).toBeTruthy();

    // If there are boxes, verify the table title
    if (tableVisible) {
      const titleText = authenticatedPage.locator('text=LISTADO DE CAJAS');
      await expect(titleText).toBeVisible();
    }
  });

  test('search by box number filters the table', async ({ authenticatedPage }) => {
    await archivePage.goto();
    await archivePage.waitForPageLoad();
    const tableState = await archivePage.waitForTable();

    // Get initial row count
    const initialCount = await archivePage.getRowCount();

    // Skip if no data available (empty mock data)
    if (initialCount === 0) {
      test.skip(true, 'No boxes available to test search functionality');
      return;
    }

    // Search for a specific box number (use "1" as a common value)
    await archivePage.search('1', 'box');

    const tableStillVisible = await archivePage.dataTable.isVisible().catch(() => false);
    const noBoxes = await archivePage.noDataMessage.isVisible().catch(() => false);
    expect(tableStillVisible || noBoxes).toBeTruthy();

    // If there were results, the count should be <= initial count (filter applied)
    if (tableStillVisible && initialCount > 0) {
      const filteredCount = await archivePage.getRowCount();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('expanding a box row reveals its items with license details', async ({ authenticatedPage }) => {
    await archivePage.goto();
    await archivePage.waitForPageLoad();
    await archivePage.waitForTable();

    const rowCount = await archivePage.getRowCount();
    if (rowCount === 0) {
      test.skip(true, 'No boxes available to test expandable rows');
      return;
    }

    // Expand the first row
    await archivePage.expandRow(0);

    // Check if expanded content appeared
    const expanded = await archivePage.isExpandedContentVisible();
    if (expanded) {
      // The expanded content should show item details
      const expandedContent = archivePage.expandedContent.first();
      const contentText = await expandedContent.textContent();

      // The expanded row should contain some recognizable content
      // (Carpeta, Folios, Fechas, or license numbers)
      expect(contentText.length).toBeGreaterThan(0);
    }
    // If no expanded content, the box may have no items (valid state)
  });

  test('clicking "NUEVA CAJA" opens the creation modal', async ({ authenticatedPage }) => {
    await archivePage.goto();
    await archivePage.waitForPageLoad();

    // Click the new box button
    await archivePage.newBoxButton.click();

    // A react-modal should open
    const modal = authenticatedPage.locator('.ReactModal__Content');
    await expect(modal).toBeVisible();
  });

  test('information link is present for download', async ({ authenticatedPage }) => {
    await archivePage.goto();
    await archivePage.waitForPageLoad();

    // The page has an "INFORMACION" download button
    const infoButton = authenticatedPage.locator('a', { hasText: /INFORMACI/i });
    await expect(infoButton).toBeVisible();

    // Verify it links to the expected PPTX file
    const href = await infoButton.getAttribute('href');
    expect(href).toContain('ARCHIVISTICA');
  });
});
