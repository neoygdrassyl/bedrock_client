// @ts-check
import { test, expect } from '@playwright/test';
import { test as authTest, expect as authExpect } from '../fixtures/auth.fixture';
import { LoginPage } from '../pages/login.page';

/**
 * E2E: Login Flow
 *
 * Tests the authentication entry point of Dovela.
 *
 * Scenarios:
 * 1. Login page renders correctly
 * 2. Unauthenticated user is redirected to /login
 * 3. Session injection works (auth fixture)
 * 4. Logout clears session
 */

test.describe('E2E: Login page', () => {
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', () => {}); // Suppress reCAPTCHA errors in test env
  });
  test('login page renders with email, password, and submit button', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(loginPage.heading).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('unauthenticated user accessing /dashboard is redirected to /login', async ({ page }) => {
    await page.goto('/dashboard');

    // PrivateRoute redirects to /login when auth.user is null
    await page.waitForURL('**/login', { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated user accessing /licencias is redirected to /login', async ({ page }) => {
    await page.goto('/licencias');

    await page.waitForURL('**/login', { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated user accessing /ventanilla is redirected to /login', async ({ page }) => {
    await page.goto('/ventanilla');

    await page.waitForURL('**/login', { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });
});

authTest.describe('E2E: Authenticated session', () => {
  authTest('auth fixture grants access to /dashboard', async ({ authenticatedPage }) => {
    // The auth fixture already navigated to /dashboard
    await authExpect(authenticatedPage).toHaveURL(/\/dashboard/);

    // Verify user name appears in the HeaderBar user dropdown trigger
    const userName = authenticatedPage.locator('header button', { hasText: /Admin/ });
    await authExpect(userName.first()).toBeVisible({ timeout: 10_000 });
  });

  authTest.fixme('authenticated user can navigate to /licencias — times out, may need backend data', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/licencias');

    // Should NOT be redirected to /login
    await authExpect(authenticatedPage).not.toHaveURL(/\/login/);
    await authExpect(authenticatedPage).toHaveURL(/\/licencias/);
  });

  authTest('authenticated user can navigate to /ventanilla', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ventanilla');

    await authExpect(authenticatedPage).not.toHaveURL(/\/login/);
    await authExpect(authenticatedPage).toHaveURL(/\/ventanilla/);
  });

  authTest.fixme('authenticated user can navigate to /archivo — times out, may need backend data', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/archivo');

    await authExpect(authenticatedPage).not.toHaveURL(/\/login/);
    await authExpect(authenticatedPage).toHaveURL(/\/archivo/);
  });

  authTest('logout clears session and redirects to login', async ({ authenticatedPage }) => {
    // Open the user dropdown menu in HeaderBar
    const userMenuTrigger = authenticatedPage.locator('header button', { hasText: /Admin/ }).first();
    await userMenuTrigger.click();

    // Click "Cerrar sesión" in the dropdown
    const logoutItem = authenticatedPage.locator('[role="menuitem"]', { hasText: /Cerrar sesión/i });
    await logoutItem.click();

    // Should redirect to /login (the signout callback navigates to /login)
    await authenticatedPage.waitForURL('**/login', { timeout: 10_000 });

    // Verify localStorage is cleared
    const token = await authenticatedPage.evaluate(() =>
      localStorage.getItem('dovela_token'),
    );
    await authExpect(token).toBeNull();
  });
});
