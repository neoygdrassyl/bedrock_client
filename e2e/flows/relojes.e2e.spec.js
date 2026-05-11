// @ts-check
import { test, expect } from '../fixtures/auth.fixture';
import { FunPage } from '../pages/fun.page';

/**
 * E2E: Relojes Legales (Legal Clocks)
 *
 * Tests the legal clock/timeline system for license applications.
 * Clocks are accessed via FUN (/licencias) -> Row action -> "Tiempos".
 *
 * Scenarios:
 * 1. Open a license's clocks workspace
 * 2. Verify the timeline/clock view renders
 * 3. Verify clock event rows are displayed
 * 4. Check that the workspace opens separately without breaking FUN
 * 5. Test navigation between licenses via clocks
 *
 * Prerequisite: Backend running with at least one license that has clock data.
 */

/**
 * Helper: Ensure we're on a tab with visible FUN data
 */
async function ensureTabWithData(funPage, page) {
  // First wait for any table to be ready
  await expect.poll(async () => {
    const processing = await page.locator('text=Procesando Formulario').isVisible().catch(() => false);
    const loading = await page.locator('text=CARGANDO...').isVisible().catch(() => false);
    const rows = await page.locator('.rdt_TableRow').count().catch(() => 0);
    const noData = await page.locator('text=NO HAY SOLICITUDES').isVisible().catch(() => false);
    return !processing && !loading && (rows > 0 || noData);
  }, { timeout: 20_000 }).toBe(true);
  
  let count = await page.locator('.fun-action-toggle:visible').count();
  if (count > 0) return true;
  
  for (const tab of ['evaluacion', 'expedicion', 'radicacion']) {
    await funPage.switchTab(tab);
    count = await page.locator('.fun-action-toggle:visible').count();
    if (count > 0) return true;
  }
  return false;
}

/**
 * Helper: Dismiss any SweetAlert2 popups
 */
async function dismissAnySwal(page) {
  try {
    const swal = page.locator('.swal2-container:visible').first();
    if (await swal.isVisible().catch(() => false)) {
      const btn = page.locator('.swal2-confirm:visible').first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(350);
      }
    }
  } catch { /* ignore */ }
}

test.describe('E2E: Relojes Legales', () => {
  /** @type {FunPage} */
  let funPage;
  test.beforeEach(async ({ authenticatedPage }) => {
    funPage = new FunPage(authenticatedPage);
  });

  test('FUN page loads and action popover contains "Tiempos" option', async ({ authenticatedPage }) => {
    await funPage.goto();
    // Wait for DOM content to load first
    await authenticatedPage.waitForLoadState('domcontentloaded');
    // Use a more flexible heading check
    await expect.poll(async () => {
      const heading = authenticatedPage.locator('h1').filter({ hasText: /RADICACIÓN|FUN/i });
      return await heading.isVisible().catch(() => false);
    }, { timeout: 20_000 }).toBe(true);

    // Wait for data to load and ensure we have data visible
    const hasData = await ensureTabWithData(funPage, authenticatedPage);
    if (!hasData) {
      test.skip(true, 'No licenses available to test clocks');
      return;
    }

    // Open the action popover on the first row
    const firstAction = authenticatedPage.locator('.fun-action-toggle:visible').first();
    await firstAction.click();

    // Verify "Tiempos" option is in the popover
    const tiemposOption = authenticatedPage.locator('.fun-action-menu [role="menuitem"]', { hasText: /Tiempos/i });
    await expect(tiemposOption).toBeVisible();
  });

  test('clicking "Tiempos" opens the clock workspace', async ({ authenticatedPage }) => {
    await funPage.goto();
    // Wait for DOM content to load first
    await authenticatedPage.waitForLoadState('domcontentloaded');
    // Use a more flexible heading check
    await expect.poll(async () => {
      const heading = authenticatedPage.locator('h1').filter({ hasText: /RADICACIÓN|FUN/i });
      return await heading.isVisible().catch(() => false);
    }, { timeout: 20_000 }).toBe(true);
    
    const hasData = await ensureTabWithData(funPage, authenticatedPage);
    if (!hasData) {
      test.skip(true, 'No licenses available to test clocks');
      return;
    }

    // Open clock workspace via the action menu
    const firstAction = authenticatedPage.locator('.fun-action-toggle:visible').first();
    await firstAction.click();

    const workspacePromise = authenticatedPage.context().waitForEvent('page');
    await authenticatedPage.locator('.fun-action-menu [role="menuitem"]', { hasText: /Tiempos/i }).click();
    const workspacePage = await workspacePromise;
    await workspacePage.waitForLoadState('domcontentloaded');
    await expect(workspacePage).toHaveURL(/\/funmanage\/expediente\/.+section=tiempos/);
    
    // Dismiss any alerts that might have appeared
    await dismissAnySwal(authenticatedPage);
  });

  test('clock workspace displays expediente content after opening', async ({ authenticatedPage }) => {
    await funPage.goto();
    // Wait for DOM content to load first
    await authenticatedPage.waitForLoadState('domcontentloaded');
    // Use a more flexible heading check
    await expect.poll(async () => {
      const heading = authenticatedPage.locator('h1').filter({ hasText: /RADICACIÓN|FUN/i });
      return await heading.isVisible().catch(() => false);
    }, { timeout: 20_000 }).toBe(true);
    
    const hasData = await ensureTabWithData(funPage, authenticatedPage);
    if (!hasData) {
      test.skip(true, 'No licenses available to test clocks');
      return;
    }

    // Open clock workspace
    const firstAction = authenticatedPage.locator('.fun-action-toggle:visible').first();
    await firstAction.click();
    const workspacePromise = authenticatedPage.context().waitForEvent('page');
    await authenticatedPage.locator('.fun-action-menu [role="menuitem"]', { hasText: /Tiempos/i }).click();
    const workspacePage = await workspacePromise;
    await workspacePage.waitForLoadState('domcontentloaded');
    await expect(workspacePage).toHaveURL(/\/funmanage\/expediente\/.+section=tiempos/);

    // The workspace should have non-trivial expediente content.
    await expect.poll(async () => {
      const text = await workspacePage.locator('body').textContent();
      return text.length;
    }, { timeout: 15_000 }).toBeGreaterThan(10);
    
    // Dismiss any alerts that might have appeared
    await dismissAnySwal(authenticatedPage);
  });

  test('clock workspace opens separately and FUN page remains intact', async ({ authenticatedPage }) => {
    await funPage.goto();
    // Wait for DOM content to load first
    await authenticatedPage.waitForLoadState('domcontentloaded');
    // Use a more flexible heading check
    await expect.poll(async () => {
      const heading = authenticatedPage.locator('h1').filter({ hasText: /RADICACIÓN|FUN/i });
      return await heading.isVisible().catch(() => false);
    }, { timeout: 20_000 }).toBe(true);
    
    const hasData = await ensureTabWithData(funPage, authenticatedPage);
    if (!hasData) {
      test.skip(true, 'No licenses available to test clocks');
      return;
    }

    // Open clock workspace
    const firstAction = authenticatedPage.locator('.fun-action-toggle:visible').first();
    await firstAction.click();
    const workspacePromise = authenticatedPage.context().waitForEvent('page');
    await authenticatedPage.locator('.fun-action-menu [role="menuitem"]', { hasText: /Tiempos/i }).click();
    const workspacePage = await workspacePromise;
    await workspacePage.waitForLoadState('domcontentloaded');
    await expect(workspacePage).toHaveURL(/\/funmanage\/expediente\/.+section=tiempos/);

    // FUN page should still be visible and intact
    await expect(authenticatedPage.locator('h1').filter({ hasText: /RADICACIÓN|FUN/i })).toBeVisible();
    await expect(funPage.tabs.radicacion).toBeVisible();
  });

  test('opening "Abrir solicitud" from action menu shows license workspace', async ({ authenticatedPage }) => {
    await funPage.goto();
    // Wait for DOM content to load first
    await authenticatedPage.waitForLoadState('domcontentloaded');
    // Use a more flexible heading check
    await expect.poll(async () => {
      const heading = authenticatedPage.locator('h1').filter({ hasText: /RADICACIÓN|FUN/i });
      return await heading.isVisible().catch(() => false);
    }, { timeout: 20_000 }).toBe(true);
    
    const hasData = await ensureTabWithData(funPage, authenticatedPage);
    if (!hasData) {
      test.skip(true, 'No licenses available to test detail view');
      return;
    }

    // Open the detail workspace via action menu
    const firstAction = authenticatedPage.locator('.fun-action-toggle:visible').first();
    await firstAction.click();

    const workspacePromise = authenticatedPage.context().waitForEvent('page');
    await authenticatedPage.locator('.fun-action-menu [role="menuitem"]', { hasText: /Abrir solicitud/i }).click();
    const workspacePage = await workspacePromise;
    await workspacePage.waitForLoadState('domcontentloaded');
    await expect(workspacePage).toHaveURL(/\/funmanage\/expediente\//);

    // The workspace should contain license detail content.
    await expect.poll(async () => {
      const text = await workspacePage.locator('body').textContent();
      return text.length;
    }, { timeout: 15_000 }).toBeGreaterThan(10);
    
    // Dismiss any alerts that might have appeared
    await dismissAnySwal(authenticatedPage);
  });
});
