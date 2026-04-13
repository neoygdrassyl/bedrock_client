// @ts-check
import { test, expect } from '../fixtures/auth.fixture';
import { FunPage } from '../pages/fun.page';
import { ClocksPage } from '../pages/clocks.page';

/**
 * E2E: Relojes Legales (Legal Clocks)
 *
 * Tests the legal clock/timeline system for license applications.
 * Clocks are accessed via FUN (/fun) -> Row action -> "Tiempos".
 *
 * Scenarios:
 * 1. Open a license's clocks modal
 * 2. Verify the timeline/clock view renders
 * 3. Verify clock event rows are displayed
 * 4. Check that the modal can be closed
 * 5. Test navigation between licenses via clocks
 *
 * Prerequisite: Backend running with at least one license that has clock data.
 */

test.describe.skip('E2E: Relojes Legales', () => {
  /** @type {FunPage} */
  let funPage;
  /** @type {ClocksPage} */
  let clocksPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    funPage = new FunPage(authenticatedPage);
    clocksPage = new ClocksPage(authenticatedPage);
  });

  test('FUN page loads and action popover contains "Tiempos" option', async ({ authenticatedPage }) => {
    await funPage.goto();
    await funPage.waitForPageLoad();

    // Wait for data to load
    await authenticatedPage.waitForTimeout(3000);

    const actionCount = await funPage.getActionToggleCount();
    if (actionCount === 0) {
      test.skip(true, 'No licenses available to test clocks');
      return;
    }

    // Open the action popover on the first row
    const firstAction = authenticatedPage.locator('.fun-action-toggle:visible').first();
    await firstAction.click();

    // Verify "Tiempos" option is in the popover
    const tiemposOption = authenticatedPage.locator('.fun-action-menu button', { hasText: /Tiempos/i });
    await expect(tiemposOption).toBeVisible();
  });

  test('clicking "Tiempos" opens the clock modal', async ({ authenticatedPage }) => {
    await funPage.goto();
    await funPage.waitForPageLoad();
    await authenticatedPage.waitForTimeout(3000);

    const actionCount = await funPage.getActionToggleCount();
    if (actionCount === 0) {
      test.skip(true, 'No licenses available to test clocks');
      return;
    }

    // Open clock modal via the action menu
    const firstAction = authenticatedPage.locator('.fun-action-toggle:visible').first();
    await firstAction.click();

    const tiemposOption = authenticatedPage.locator('.fun-action-menu button', { hasText: /Tiempos/i });
    await tiemposOption.click();

    // Wait for the modal to open
    await authenticatedPage.waitForTimeout(2000);

    // A react-modal should now be visible
    const modalVisible = await clocksPage.isModalVisible();
    expect(modalVisible).toBeTruthy();
  });

  test('clock modal displays clock content after opening', async ({ authenticatedPage }) => {
    await funPage.goto();
    await funPage.waitForPageLoad();
    await authenticatedPage.waitForTimeout(3000);

    const actionCount = await funPage.getActionToggleCount();
    if (actionCount === 0) {
      test.skip(true, 'No licenses available to test clocks');
      return;
    }

    // Open clock modal
    const firstAction = authenticatedPage.locator('.fun-action-toggle:visible').first();
    await firstAction.click();
    const tiemposOption = authenticatedPage.locator('.fun-action-menu button', { hasText: /Tiempos/i });
    await tiemposOption.click();
    await authenticatedPage.waitForTimeout(2000);

    // The modal should contain some content (clock rows, gantt, or info)
    const modal = authenticatedPage.locator('.ReactModal__Content').last();
    await expect(modal).toBeVisible();

    // The modal should have non-trivial content (not empty)
    const modalText = await modal.textContent();
    expect(modalText.length).toBeGreaterThan(10);
  });

  test('clock modal can be closed and FUN page remains intact', async ({ authenticatedPage }) => {
    await funPage.goto();
    await funPage.waitForPageLoad();
    await authenticatedPage.waitForTimeout(3000);

    const actionCount = await funPage.getActionToggleCount();
    if (actionCount === 0) {
      test.skip(true, 'No licenses available to test clocks');
      return;
    }

    // Open clock modal
    const firstAction = authenticatedPage.locator('.fun-action-toggle:visible').first();
    await firstAction.click();
    const tiemposOption = authenticatedPage.locator('.fun-action-menu button', { hasText: /Tiempos/i });
    await tiemposOption.click();
    await authenticatedPage.waitForTimeout(2000);

    // Verify modal is open
    expect(await clocksPage.isModalVisible()).toBeTruthy();

    // Close the modal by pressing Escape (react-modal default behavior)
    await authenticatedPage.keyboard.press('Escape');
    await authenticatedPage.waitForTimeout(500);

    // FUN page should still be visible and intact
    await expect(funPage.heading).toBeVisible();
    await expect(funPage.tabs.radicacion).toBeVisible();
  });

  test('opening "Detalles" from action menu shows license detail modal', async ({ authenticatedPage }) => {
    await funPage.goto();
    await funPage.waitForPageLoad();
    await authenticatedPage.waitForTimeout(3000);

    const actionCount = await funPage.getActionToggleCount();
    if (actionCount === 0) {
      test.skip(true, 'No licenses available to test detail view');
      return;
    }

    // Open the detail modal via action menu
    const firstAction = authenticatedPage.locator('.fun-action-toggle:visible').first();
    await firstAction.click();

    const detallesOption = authenticatedPage.locator('.fun-action-menu button', { hasText: /Detalles/i });
    await detallesOption.click();

    // Wait for the modal and its content to load
    await authenticatedPage.waitForTimeout(3000);

    // A react-modal should be visible with license details
    const modal = authenticatedPage.locator('.ReactModal__Content').last();
    await expect(modal).toBeVisible();

    // The modal should contain the license detail content
    const modalText = await modal.textContent();
    expect(modalText.length).toBeGreaterThan(10);
  });
});
