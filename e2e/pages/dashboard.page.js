// @ts-check

/**
 * Page Object: Dashboard (/dashboard)
 *
 * The dashboard is the landing page after login: a customizable widget grid
 * (KPIs, quick access, recent and tracked expedientes, module groups). The
 * AppShell (floating sidebar + HeaderBar) wraps all authenticated pages.
 *
 * Navigation in the current shell:
 * - Sidebar: `nav[aria-label="Navegación principal"]` with links per module
 *   (the account menu lives in the sidebar footer, not in the header)
 * - HeaderBar: breadcrumb, command palette, chat and theme toggle
 * - Module widgets: direct links on the dashboard grid
 */
export class DashboardPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Page heading: the dashboard greets the user ("Buenos días, <name>")
    this.heading = page.locator('h1', { hasText: /Buen[oa]s? (días|tardes|noches)/i });

    // Account menu trigger in the sidebar footer (aria-label "Cuenta de <name>")
    this.userMenuTrigger = page.getByRole('button', { name: /^Cuenta de / });

    // "Personalizar" switches the widget grid into edit mode
    this.customizeButton = page.getByRole('button', { name: 'Personalizar' });

    // Module card links (new Spanish routes)
    this.moduleCards = {
      licencias: page.locator('a[href="/licencias"]').first(),
      ventanilla: page.locator('a[href="/ventanilla"]').first(),
      archivo: page.locator('a[href="/archivo"]').first(),
      peticiones: page.locator('a[href="/peticiones"]').first(),
      nomenclatura: page.locator('a[href="/nomenclatura"]').first(),
      mensajes: page.locator('a[href="/mensajes"]').first(),
    };

    // Sidebar navigation links (stable by route; labels hide when the rail collapses)
    const nav = page.locator('nav[aria-label="Navegación principal"]');
    this.railButtons = {
      dashboard: nav.locator('a[href="/dashboard"]'),
      licencias: nav.locator('a[href="/licencias"]'),
      ventanilla: nav.locator('a[href="/ventanilla"]'),
      archivo: nav.locator('a[href="/archivo"]'),
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
   * Navigate to a module via the sidebar.
   * @param {'dashboard' | 'licencias' | 'ventanilla' | 'archivo'} module
   */
  async navigateViaRail(module) {
    await this.railButtons[module].click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Open the account menu in the sidebar footer.
   */
  async openUserMenu() {
    await this.userMenuTrigger.click();
  }

  /**
   * Log out via the sidebar account menu.
   */
  async logout() {
    await this.openUserMenu();
    const logoutItem = this.page.locator('[role="menuitem"]', { hasText: /Cerrar sesión/i });
    await logoutItem.click();
  }
}
