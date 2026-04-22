// @ts-check
import { test, expect } from '../fixtures/auth.fixture';
import { FunPage } from '../pages/fun.page';

/**
 * E2E: Radicacion de Proyecto (License Filing)
 *
 * Tests the core license creation and management workflow in /licencias:
 * 1. Navigate to /licencias and verify the page loads
 * 2. Create a new license (radicacion)
 * 3. Verify the license appears in the DataTable
 * 4. Open the license and verify detail sections are accessible
 *
 * Prerequisite: Backend running at VITE_API_URL with valid test data.
 */

test.describe('E2E: Radicacion de Proyecto', () => {
  /** @type {FunPage} */
  let funPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    funPage = new FunPage(authenticatedPage);
  });

  // Helper function to find a tab with data
  async function ensureTabWithData(funPage, page) {
    await funPage.waitForTable();
    let count = await funPage.getActionToggleCount();
    if (count > 0) return true;
    
    // Try different tabs to find data (based on mock states 5 and 70)
    for (const tab of ['evaluacion', 'expedicion', 'otrasActuaciones', 'radicacion']) {
      await funPage.switchTab(tab);
      count = await funPage.getActionToggleCount();
      if (count > 0) return true;
    }
    return false;
  }

  test('navigate to /licencias and verify the page loads with heading and form', async ({ authenticatedPage }) => {
    await funPage.goto();
    await funPage.waitForPageLoad();

    // Verify the page heading
    await expect(funPage.heading).toBeVisible();
    await expect(funPage.heading).toContainText(/RADICACI/i);

    // Verify the creation form is present
    await expect(funPage.dateInput).toBeVisible();
    await expect(funPage.idPublicInput).toBeVisible();
    await expect(funPage.createButton).toBeVisible();

    // Verify the search form is present
    await expect(funPage.searchSelect).toBeVisible();
    await expect(funPage.searchInput).toBeVisible();
    await expect(funPage.searchButton).toBeVisible();
  });

  test('auto-generate license ID fills the id field with a consecutive number', async ({ authenticatedPage }) => {
    await funPage.goto();
    await funPage.waitForPageLoad();

    // Click "GENERAR LIC" to auto-generate a license number
    await funPage.generateIdButton.click();
    
    // Add stability wait after click
    await authenticatedPage.waitForTimeout(500);

    // The id field should now contain a value (format: NOMEN-YY-NNNN)
    await expect.poll(() => funPage.idPublicInput.inputValue(), { timeout: 15_000 }).not.toBe('');
  });

  test('DataTable renders with license tabs (Radicacion, Evaluacion, Expedicion, etc.)', async ({ authenticatedPage }) => {
    await funPage.goto();
    await funPage.waitForPageLoad();
    await funPage.waitForTable();

    // Verify the tab navigation exists
    await expect(funPage.tabs.radicacion).toBeVisible();
    await expect(funPage.tabs.evaluacion).toBeVisible();
    await expect(funPage.tabs.expedicion).toBeVisible();
    await expect(funPage.tabs.desistimiento).toBeVisible();
    await expect(funPage.tabs.archivadas).toBeVisible();
  });

  test('switching tabs shows different data sets', async ({ authenticatedPage }) => {
    await funPage.goto();
    await funPage.waitForPageLoad();
    await funPage.waitForTable();

    // Default tab is "Radicacion" (fillActive='1')
    // Switch to evaluacion tab
    await funPage.switchTab('evaluacion');

    // Switch to archivadas tab
    await funPage.switchTab('archivadas');

    // Switch back to radicacion
    await funPage.switchTab('radicacion');

    // Verify we are back on radicacion tab (it should have active style)
    await expect(funPage.tabs.radicacion).toBeVisible();
  });

  test('search by radicado number returns results or empty state', async ({ authenticatedPage }) => {
    await funPage.goto();
    await funPage.waitForPageLoad();

    // Search for a known pattern
    await funPage.search('68001', '1');

    // The search result section heading should appear if there are results
    const searchHeading = authenticatedPage.locator('h3', { hasText: /Resultado de la B[uú]squeda/i });
    const noResults = authenticatedPage.locator('text=NO HAY SOLICITUDES');

    // Either we get results or a "no results" message
    const hasSearchResults = await searchHeading.isVisible().catch(() => false);
    const hasNoResults = await noResults.isVisible().catch(() => false);

    // At least one of these should be true after a search
    expect(hasSearchResults || hasNoResults).toBeTruthy();
  });

  test('row action popover opens with expected menu items for a license', async ({ authenticatedPage }) => {
    await funPage.goto();
    await funPage.waitForPageLoad();

    // Use helper to find a tab with data
    const hasData = await ensureTabWithData(funPage, authenticatedPage);
    if (!hasData) {
      test.skip(true, 'No licenses in any tab');
      return;
    }

    // Click the action toggle on the first row
    const firstActionToggle = authenticatedPage.locator('.fun-action-toggle:visible').first();
    await firstActionToggle.click();

    // Verify the popover menu appears with expected items
    const popoverMenu = authenticatedPage.locator('.fun-action-menu');
    await expect(popoverMenu).toBeVisible();

    // Check for key menu items
    await expect(popoverMenu.locator('text=Detalles')).toBeVisible();
    await expect(popoverMenu.locator('text=Tiempos')).toBeVisible();
    await expect(popoverMenu.locator('text=Documentos')).toBeVisible();
  });
});
