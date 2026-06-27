// @ts-check

/**
 * Page Object: Dashboard (/dashboard)
 *
 * The dashboard is the landing page after login. It shows module cards
 * in a responsive grid. The AppShell (IconRail + HeaderBar) wraps all
 * authenticated pages.
 *
 * Navigation in the redesigned UI:
 * - IconRail: dark sidebar with icon-only buttons (aria-label matches module name)
 * - HeaderBar: top bar with breadcrumb, theme toggle, and user dropdown
 * - Module cards: direct links on the dashboard grid
 */
export class DashboardPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Page heading (dashboard)
    this.heading = page.locator('h1', { hasText: /Panel de Control/i });

    // HeaderBar user dropdown trigger (shows user name on md+ viewports)
    this.userMenuTrigger = page.locator('header button', { hasText: /Admin/ });

    // Module card links (new Spanish routes)
    this.moduleCards = {
      licencias: page.locator('a[href="/licencias"]').first(),
      ventanilla: page.locator('a[href="/ventanilla"]').first(),
      archivo: page.locator('a[href="/archivo"]').first(),
      peticiones: page.locator('a[href="/peticiones"]').first(),
      nomenclatura: page.locator('a[href="/nomenclatura"]').first(),
      mensajes: page.locator('a[href="/mensajes"]').first(),
    };

    // IconRail navigation buttons (aria-labels match module names)
    this.railButtons = {
      dashboard: page.locator('nav[aria-label="Navegación principal"] button[aria-label="Dashboard"]'),
      licencias: page.locator('nav[aria-label="Navegación principal"] button[aria-label="Licencias"]'),
      ventanilla: page.locator('nav[aria-label="Navegación principal"] button[aria-label="Ventanilla"]'),
      archivo: page.locator('nav[aria-label="Navegación principal"] button[aria-label="Archivo"]'),
    };
  }

  /** Navigate to /dashboard */
  async goto() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Navigate to a module via the dashboard card links.
   * @param {'licencias' | 'ventanilla' | 'archivo' | 'peticiones' | 'nomenclatura' | 'mensajes'} module
   */
  async navigateViaCard(module) {
    await this.moduleCards[module].click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Navigate to a module via the IconRail sidebar.
   * @param {'dashboard' | 'licencias' | 'ventanilla' | 'archivo'} module
   */
  async navigateViaRail(module) {
    await this.railButtons[module].click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Open the user dropdown menu in the HeaderBar.
   */
  async openUserMenu() {
    await this.userMenuTrigger.click();
  }

  /**
   * Log out via the HeaderBar user dropdown.
   */
  async logout() {
    await this.openUserMenu();
    const logoutItem = this.page.locator('[role="menuitem"]', { hasText: /Cerrar sesión/i });
    await logoutItem.click();
  }
}
