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

test.describe.skip('E2E: Login page', () => {
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

  test('unauthenticated user accessing /fun is redirected to /login', async ({ page }) => {
    await page.goto('/fun');

    await page.waitForURL('**/login', { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated user accessing /submit is redirected to /login', async ({ page }) => {
    await page.goto('/submit');

    await page.waitForURL('**/login', { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });
});

authTest.describe.skip('E2E: Authenticated session', () => {
  authTest('auth fixture grants access to /dashboard', async ({ authenticatedPage }) => {
    // The auth fixture already navigated to /dashboard
    await authExpect(authenticatedPage).toHaveURL(/\/dashboard/);

    // Verify user name appears in the navbar (RSuite Nav.Menu title)
    const userName = authenticatedPage.locator('text=Admin Test');
    await authExpect(userName.first()).toBeVisible({ timeout: 10_000 });
  });

  authTest('authenticated user can navigate to /fun', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/fun');

    // Should NOT be redirected to /login
    await authExpect(authenticatedPage).not.toHaveURL(/\/login/);
    await authExpect(authenticatedPage).toHaveURL(/\/fun/);
  });

  authTest('authenticated user can navigate to /submit', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/submit');

    await authExpect(authenticatedPage).not.toHaveURL(/\/login/);
    await authExpect(authenticatedPage).toHaveURL(/\/submit/);
  });

  authTest('authenticated user can navigate to /archive', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/archive');

    await authExpect(authenticatedPage).not.toHaveURL(/\/login/);
    await authExpect(authenticatedPage).toHaveURL(/\/archive/);
  });

  authTest('logout clears session and redirects to login', async ({ authenticatedPage }) => {
    // Open the user menu (RSuite Nav.Menu)
    const userMenuTrigger = authenticatedPage.locator('text=Admin Test').first();
    await userMenuTrigger.click();

    // Click "Log out"
    const logoutItem = authenticatedPage.locator('text=Log out');
    await logoutItem.click();

    // Should redirect to /home (the signout callback navigates to /home)
    await authenticatedPage.waitForURL('**/home', { timeout: 10_000 });

    // Verify localStorage is cleared
    const token = await authenticatedPage.evaluate(() =>
      localStorage.getItem('dovela_token'),
    );
    await authExpect(token).toBeNull();
  });
});
