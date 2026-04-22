// @ts-check

/**
 * Page Object: Login page (/login)
 *
 * Encapsulates locators and actions for the Dovela login form.
 * The login form uses ReCAPTCHA (invisible), an email input, a password
 * input, and a submit button.
 *
 * For E2E tests that need to bypass ReCAPTCHA, use the auth fixture instead.
 * This Page Object is for tests that explicitly test the login UI behavior.
 */
export class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Locators — match the redesigned split-screen LoginPage component
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('button[type="submit"]');
    this.heading = page.locator('h2', { hasText: /Iniciar sesión/i });
    this.errorAlert = page.locator('.swal2-popup');
  }

  /** Navigate to /login */
  async goto() {
    await this.page.goto('/login');
    await this.heading.waitFor({ state: 'visible', timeout: 15_000 });
  }

  /**
   * Fill the login form and submit.
   * Note: This will trigger ReCAPTCHA. For local testing against a real
   * backend, the site key must be the test key from Google, or the backend
   * must skip validation.
   *
   * @param {string} email
   * @param {string} password
   */
  async fillAndSubmit(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /**
   * Perform a full login and wait for redirect to /dashboard.
   * Only works when ReCAPTCHA is configured for testing.
   *
   * @param {string} email
   * @param {string} password
   */
  async login(email = 'test@gmail.com', password = 'test123') {
    await this.fillAndSubmit(email, password);
    await this.page.waitForURL('**/dashboard', { timeout: 15_000 });
  }

  /** Check whether the login heading is visible */
  async isVisible() {
    return this.heading.isVisible();
  }
}
