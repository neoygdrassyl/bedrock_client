// @ts-check
import { expect } from '@playwright/test';

/**
 * Page Object: FUN / Licencias (/fun)
 *
 * The FUN page is the core module of Dovela. It manages construction license
 * applications through the full legal lifecycle (radicacion -> resolucion).
 *
 * Key DOM elements (from src/app/pages/user/fun.js):
 * - Heading: "RADICACION DE SOLICITUDES"
 * - Create form: #f_01 (date), #f_02 (id_public), "GENERAR LIC" button, "CREAR" submit
 * - Search form: #search_0 (select), #search_1 (input), "CONSULTAR" submit
 * - DataTable with tabs: Radicacion, Evaluacion, Expedicion, OA, Desistimiento, Archivadas
 * - Row action popover: Detalles, Tiempos, Documentos, Actualizar, etc.
 */
export class FunPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Page heading
    this.heading = page.locator('h1', { hasText: /RADICACIÓN DE SOLICITUDES/i });

    // --- Creation form ---
    this.dateInput = page.locator('#f_01');
    this.idPublicInput = page.locator('#f_02');
    this.generateIdButton = page.locator('button', { hasText: /GENERAR LIC/i });
    this.createButton = page.locator('button', { hasText: /CREAR/i });

    // --- Search form ---
    this.searchSelect = page.locator('#search_0');
    this.searchInput = page.locator('#search_1');
    this.searchButton = page.locator('button', { hasText: /CONSULTAR/i });

    // --- DataTable ---
    this.dataTable = page.locator('.rdt_Table').first();
    this.tableRows = page.locator('.rdt_TableRow');
    this.actionToggles = page.locator('.fun-action-toggle');
    this.visibleActionToggles = page.locator('.fun-action-toggle:visible');
    this.noDataMessage = page.locator('text=NO HAY SOLICITUDES').first();
    this.loadingMessage = page.locator('text=CARGANDO...').first();
    this.processingDialog = page.getByRole('dialog', { name: /Procesando Formulario/i });
    this.searchResultsHeading = page.locator('h3', { hasText: /Resultado de la B[uú]squeda/i });

    // --- Tab navigation (MDBTabs) ---
    this.tabs = {
      radicacion: page.getByRole('tab', { name: /Radicaci/i }).first(),
      evaluacion: page.getByRole('tab', { name: /Evaluaci/i }).first(),
      expedicion: page.getByRole('tab', { name: /Expedici/i }).first(),
      otrasActuaciones: page.getByRole('tab', { name: /Otras Actuaciones/i }).first(),
      desistimiento: page.getByRole('tab', { name: /Desistimiento/i }).first(),
      archivadas: page.getByRole('tab', { name: /Archivadas/i }).first(),
    };
  }

  /** Navigate to /licencias (canonical) — legacy /fun redirects here */
  async goto() {
    await this.page.goto('/licencias');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Wait for the heading to confirm the page loaded */
  async waitForPageLoad() {
    await this.heading.waitFor({ state: 'visible', timeout: 15_000 });
  }

  /** Wait for any DataTable to become visible */
  async waitForTable() {
    await expect.poll(async () => {
      const processing = await this.processingDialog.isVisible().catch(() => false);
      const loading = await this.loadingMessage.isVisible().catch(() => false);
      const rows = await this.tableRows.count().catch(() => 0);
      const noData = await this.noDataMessage.isVisible().catch(() => false);
      return !processing && !loading && (rows > 0 || noData);
    }, { timeout: 20_000 }).toBe(true);
  }

  /** Get visible row count in the first DataTable */
  async getRowCount() {
    return this.tableRows.count();
  }

  async getActionToggleCount() {
    return this.visibleActionToggles.count();
  }

  /**
   * Create a new license (radicacion).
   * @param {object} opts
   * @param {string} opts.date - Date in YYYY-MM-DD format
   * @param {string} [opts.idPublic] - If omitted, clicks "GENERAR LIC" to auto-generate
   */
  async createLicense({ date, idPublic }) {
    await this.dateInput.fill(date);
    if (idPublic) {
      await this.idPublicInput.fill(idPublic);
    } else {
      await this.generateIdButton.click();
      // Wait for the async id generation to complete
      await this.page.waitForTimeout(1000);
    }
    await this.createButton.click();
  }

  /**
   * Search for a license.
   * @param {string} query - Search text
   * @param {string} [fieldValue='1'] - Field select value (1=Radicado, 2=Matricula, etc.)
   */
  async search(query, fieldValue = '1') {
    await this.searchSelect.selectOption(fieldValue);
    await this.searchInput.fill(query);
    await this.searchButton.click();
    await expect.poll(async () => {
      const processing = await this.processingDialog.isVisible().catch(() => false);
      const searchHeading = await this.searchResultsHeading.isVisible().catch(() => false);
      const noData = await this.noDataMessage.isVisible().catch(() => false);
      return !processing && (searchHeading || noData);
    }, { timeout: 20_000 }).toBe(true);
  }

  /**
   * Open the action popover for a row, then click an action.
   * @param {string} rowText - Text to identify the row (e.g. id_public)
   * @param {'Detalles' | 'Tiempos' | 'Documentos' | 'Actualizar'} action
   */
  async openRowAction(rowText, action) {
    // Click the popover trigger (ellipsis button) in the matching row
    const row = this.page.locator('.rdt_TableRow', { hasText: rowText });
    const actionToggle = row.locator('.fun-action-toggle');
    await actionToggle.click();

    // Click the specific action in the popover
    const actionButton = this.page.locator('.fun-action-menu [role="menuitem"]', { hasText: action });
    await actionButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Switch to a tab in the license list.
   * @param {'radicacion' | 'evaluacion' | 'expedicion' | 'otrasActuaciones' | 'desistimiento' | 'archivadas'} tabName
   */
  async switchTab(tabName) {
    await this.tabs[tabName].click();
    await this.waitForTable();
  }
}
