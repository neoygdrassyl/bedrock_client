// @ts-check
import { expect } from '@playwright/test';

/**
 * Page Object: Ventanilla Unica / Submit (/submit)
 *
 * Key DOM elements (from src/app/pages/user/submit/submit.js):
 * - Heading: "VENTANILLA UNICA"
 * - "NUEVA ENTRADA" button opens a modal with submit_manage form
 * - Search: #submit_search_0 (select), #submit_search_1 (text), "CONSULTAR" button
 * - DataTable columns: Nr. RADICACION, Nr. Licencia, TIPO, FECHA, DOCUMENTO, ACCION
 *
 * submit_manage form fields:
 * - #submit_1: Nr. radicacion (with GENERAR button)
 * - #submit_2: Nr. solicitud (with VERIFICAR button)
 * - #submit_4: Tipo (with datalist)
 * - #submit_3: Fecha, #submit_32: Hora
 * - #submit_5: Propietario
 * - #submit_7: Funcionario que recibe
 */
export class SubmitPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Page heading
    this.heading = page.locator('h1', { hasText: /VENTANILLA/i });

    // --- Action buttons ---
    this.newEntryButton = page.locator('button', { hasText: /NUEVA ENTRADA/i });

    // --- Search form ---
    this.searchSelect = page.locator('#submit_search_0');
    this.searchInput = page.locator('#submit_search_1');
    this.searchButton = page.locator('button', { hasText: /CONSULTAR/i });

    // --- DataTable ---
    this.dataTable = page.locator('.rdt_Table').first();
    this.tableRows = page.locator('.rdt_TableRow');
    this.noDataMessage = page.locator('text=NO HAY INFORMACION');
    this.loadingMessage = page.locator('text=CARGANDO INFORMACIÓN...');
    this.processingDialog = page.getByRole('dialog', { name: /Procesando Formulario/i });
    this.entriesHeading = page.getByRole('heading', { name: /Lista de entradas/i });

    this.newEntryModal = page.locator('.ReactModal__Content').filter({ has: page.locator('#submit_1') }).last();

    // --- Creation form fields (inside modal) ---
    this.form = {
      idPublic: page.locator('#submit_1'),
      idRelated: page.locator('#submit_2'),
      generateIdButton: this.newEntryModal.locator('button', { hasText: /^GENERAR$/ }),
      tipo: page.locator('#submit_4'),
      date: page.locator('#submit_3'),
      time: page.locator('#submit_32'),
      owner: page.locator('#submit_5'),
      worker: page.locator('#submit_7'),
    };
  }

  /** Navigate to /submit */
  async goto() {
    await this.page.goto('/submit', { timeout: 60_000 });
    // networkidle can hang in this module due to background polling; use DOM-ready + explicit UI assertions.
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Wait for heading to confirm page loaded */
  async waitForPageLoad() {
    await this.heading.waitFor({ state: 'visible', timeout: 30_000 });
  }

  /** Wait for the DataTable to render */
  async waitForTable() {
    await expect.poll(async () => {
      const processing = await this.processingDialog.isVisible().catch(() => false);
      const loading = await this.loadingMessage.isVisible().catch(() => false);
      const table = await this.dataTable.isVisible().catch(() => false);
      const noData = await this.noDataMessage.isVisible().catch(() => false);
      return !processing && !loading && (table || noData);
    }, { timeout: 30_000 }).toBe(true);
  }

  /** Get visible row count */
  async getRowCount() {
    return this.tableRows.count();
  }

  /** Open the "NUEVA ENTRADA" modal */
  async openNewEntryModal() {
    await expect(this.newEntryButton).toBeEnabled({ timeout: 15_000 });
    await this.newEntryButton.click();
    await expect(this.newEntryModal).toBeVisible();
  }

  /**
   * Search for entries.
   * @param {string} query
   * @param {string} [fieldValue='1'] - 1=Nr VR, 2=Nr Licencia, 3=Propietario, etc.
   */
  async search(query, fieldValue = '1') {
    await this.searchSelect.selectOption(fieldValue);
    await this.searchInput.fill(query);
    await this.searchButton.click();
    await this.waitForTable();
  }

  /**
   * Click the detail button on a row.
   * @param {string} text - Text to identify the row (e.g. VR number)
   */
  async openRowDetail(text) {
    const row = this.page.locator('.rdt_TableRow', { hasText: text });
    // Click the info/detail button (btn-info with folder icon)
    const detailBtn = row.locator('button.btn-info');
    await detailBtn.click();
  }
}
