// @ts-check
import { expect } from '@playwright/test';

/**
 * Page Object: Archivo Documental / Archive (/archive)
 *
 * Key DOM elements (from src/app/pages/user/archive/archive.page.js):
 * - Heading: "ARCHIVO"
 * - "NUEVA CAJA" button (MDBBtn color='success', only for roleId 1 or 3)
 * - Search: #search_param (select), #search_text (text), "BUSCAR" button
 * - DataTable with columns: Estante, Entrepaño, Caja N°, Contenido, ACCION
 * - Expandable rows: show items with id_public, Resolucion, Carpeta, Folios, Fechas
 * - Row actions: Modificar Items, Modificar caja, Eliminar caja
 */
export class ArchivePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Page heading
    this.heading = page.locator('h1', { hasText: /ARCHIVO/i });

    // --- Action buttons ---
    this.newBoxButton = page.locator('button', { hasText: /NUEVA CAJA/i });

    // --- Search form ---
    this.searchSelect = page.locator('#search_param');
    this.searchInput = page.locator('#search_text');
    this.searchButton = page.locator('button', { hasText: /BUSCAR/i });

    // --- DataTable ---
    this.dataTable = page.locator('.rdt_Table');
    this.tableRows = page.locator('.rdt_TableRow');
    this.noDataMessage = page.locator('text=NO HAY CAJAS');
    this.loadingMessage = page.locator('text=CARGANDO...');

    // --- Expandable row content ---
    this.expandedContent = page.locator('.rdt_ExpanderRow');
  }

  /** Navigate to /archive */
  async goto() {
    await this.page.goto('/archive');
    await this.page.waitForLoadState('domcontentloaded');

    const headingVisible = await this.heading.isVisible().catch(() => false);
    if (!headingVisible) {
      const archiveLink = this.page.locator('a[href="/archive"]').first();
      if (await archiveLink.isVisible().catch(() => false)) {
        await archiveLink.click();
        await this.page.waitForLoadState('domcontentloaded');
      }
    }
  }

  /** Wait for the heading to confirm page loaded */
  async waitForPageLoad() {
    await this.heading.waitFor({ state: 'visible', timeout: 30_000 });
  }

  /**
   * Wait for the DataTable to finish loading.
   * Three possible outcomes:
   * 1. Table visible with data rows
   * 2. "NO HAY CAJAS" empty state
   * 3. "CARGANDO..." if backend is unreachable (returns 'loading')
   * @returns {Promise<'loaded' | 'empty' | 'loading'>}
   */
  async waitForTable() {
    await expect.poll(async () => {
      const loading = await this.loadingMessage.isVisible().catch(() => false);
      const noData = await this.noDataMessage.isVisible().catch(() => false);
      const table = await this.dataTable.isVisible().catch(() => false);
      return !loading && (noData || table);
    }, { timeout: 20_000 }).toBe(true);

    if (await this.noDataMessage.isVisible().catch(() => false)) return 'empty';
    return 'loaded';
  }

  /** Get visible row count */
  async getRowCount() {
    return this.tableRows.count();
  }

  /**
   * Search for boxes.
   * @param {string} query
   * @param {string} [fieldValue='box'] - Search field: box, id_public, exp_id, date
   */
  async search(query, fieldValue = 'box') {
    await this.searchSelect.selectOption(fieldValue);
    await this.searchInput.fill(query);
    await this.searchButton.click();
    await this.waitForTable();
  }

  /**
   * Expand a row by clicking the expander button.
   * react-data-table-component renders expander as a button in the first cell.
   * @param {number} rowIndex - 0-based index
   */
  async expandRow(rowIndex) {
    const row = this.tableRows.nth(rowIndex);
    // The expander is the first button in the row (rdt_TableCell with expander)
    const expander = row.locator('button').first();
    await expander.click();
  }

  /**
   * Check if expanded content is visible after expanding a row.
   */
  async isExpandedContentVisible() {
    return this.expandedContent.first().isVisible();
  }

  /**
   * Click on a row containing specific text.
   * @param {string} text
   */
  async clickRow(text) {
    await this.page.locator('.rdt_TableRow', { hasText: text }).click();
  }

  /**
   * Click "Modificar Items" on a row (add items to box).
   * @param {number} rowIndex
   */
  async openModifyItems(rowIndex) {
    const row = this.tableRows.nth(rowIndex);
    const modifyBtn = row.locator('button.btn-primary').first();
    await modifyBtn.click();
    await this.page.waitForTimeout(500);
  }
}
