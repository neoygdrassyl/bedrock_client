// @ts-check
import { test, expect } from '../fixtures/auth.fixture';

/**
 * E2E: Login + session expiration.
 *
 * Exercises the http-common.js response interceptor fix (H-08/H-14): every
 * 401 response means "the session is dead" and must clear the stored
 * session + redirect to /login — this used to only happen for `expired:
 * true` responses, so an invalid/malformed token (e.g. after a secret
 * rotation) left the app silently failing forever on every background poll
 * instead of logging out.
 *
 * NOTE on scope — real UI login is not exercised here:
 * LoginPage.jsx's handleSubmit calls `recaptchaRef.current.execute().then(...)`,
 * but react-google-recaptcha's `execute()` (see
 * node_modules/react-google-recaptcha/src/recaptcha.js) does NOT return a
 * Promise for invisible reCAPTCHA — it forwards Google's own `execute()`,
 * which returns undefined and resolves asynchronously via a `callback`
 * option instead. Calling `.then()` on that undefined return value throws
 * "Cannot read properties of undefined (reading 'then')" synchronously,
 * so `performLogin()` is never reached. This reproduces on every submit
 * click against the live dev server in this repo (VITE_GOOGLE_CAPTCHA_HTML
 * is set in .env), independent of network/timing — a real bug, not test
 * flakiness. It should use `executeAsync()` instead. Filed as a discovery,
 * not fixed here (out of scope for this e2e task).
 *
 * Because real submission is currently unreachable, this spec reaches the
 * authenticated state the same way the rest of the e2e suite does — via
 * the auth fixture's localStorage token injection (equivalent to "a login
 * just completed") — and focuses its assertions on the interceptor
 * behavior, which is the actual target of the H-08/H-14 fix.
 */

test.describe('E2E: Login + session expiration', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test('an authenticated session survives normal use, then a 401 on any request logs out and redirects to /login', async ({ authenticatedPage: page }) => {
    page.on('pageerror', () => {});

    // The auth fixture already navigated to /dashboard with a valid session.
    await expect(page).toHaveURL(/\/dashboard/);
    const token = await page.evaluate(() => localStorage.getItem('dovela_token'));
    expect(token).toBeTruthy();

    // Simulate the session dying server-side (e.g. secret rotation or JWT
    // expiry): every subsequent API call now returns 401. Reload to trigger
    // the app's normal data-fetching cycle again — this is the exact
    // "background poll after the session died" scenario the H-08/H-14 fix
    // targets, per the comment in src/http-common.js.
    await page.route('**/*', async (route) => {
      const request = route.request();
      const resourceType = request.resourceType();
      if (resourceType === 'fetch' || resourceType === 'xhr') {
        return route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'jwt expired', expired: true }),
        });
      }
      return route.fallback();
    });

    // The interceptor's own `window.location.href = "/login"` redirect can
    // interrupt the reload's navigation lifecycle (multiple concurrent 401s
    // each triggering a redirect), so poll the URL instead of relying on a
    // single clean "load" event via waitForURL.
    await page.reload().catch(() => {});

    await expect.poll(() => page.url(), { timeout: 15_000 }).toMatch(/\/login/);
    await expect(page).toHaveURL(/\/login/);

    const tokenAfter = await page.evaluate(() => localStorage.getItem('dovela_token'));
    expect(tokenAfter).toBeNull();
    const userAfter = await page.evaluate(() => localStorage.getItem('dovela_user'));
    expect(userAfter).toBeNull();
  });

  test('a malformed/invalid token (401 without `expired: true`) also logs out — not just explicit expiry', async ({ authenticatedPage: page }) => {
    page.on('pageerror', () => {});

    await expect(page).toHaveURL(/\/dashboard/);

    // Regression guard for the H-08/H-14 fix itself: previously ONLY
    // `expired: true` triggered logout, so a bare 401 (e.g. "no autenticado"
    // from a defense-in-depth check, or a token invalidated by a secret
    // rotation) left the app stuck instead of logging out.
    await page.route('**/*', async (route) => {
      const request = route.request();
      const resourceType = request.resourceType();
      if (resourceType === 'fetch' || resourceType === 'xhr') {
        return route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'no autenticado' }),
        });
      }
      return route.fallback();
    });

    await page.reload().catch(() => {});

    await expect.poll(() => page.url(), { timeout: 15_000 }).toMatch(/\/login/);
    await expect(page).toHaveURL(/\/login/);
    const token = await page.evaluate(() => localStorage.getItem('dovela_token'));
    expect(token).toBeNull();
  });
});
