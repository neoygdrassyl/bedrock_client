// @ts-check

/**
 * Page Object: Dashboard (/dashboard)
 *
 * The dashboard is the landing page after login. It shows summary widgets,
 * navigation links to modules, and the user's name in the navbar.
 */
export class DashboardPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Navbar elements (visible on all authenticated pages)
    this.userMenu = page.locator('text=Admin Test');
    this.navLinks = {
      fun: page.locator('a[href="/fun"]'),
      submit: page.locator('a[href="/submit"]'),
      archive: page.locator('a[href="/archive"]'),
      pqrs: page.locator('a[href="/pqrsadmin"]'),
      nomenclature: page.locator('a[href="/nomenclature"]'),
    };
  }

  /** Navigate to /dashboard */
  async goto() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Navigate to a module page via the nav menu.
   * @param {'fun' | 'submit' | 'archive' | 'pqrs' | 'nomenclature'} module
   */
  async navigateTo(module) {
    // Open the user dropdown menu first (RSuite Nav.Menu)
    await this.userMenu.click();
    await this.navLinks[module].click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
