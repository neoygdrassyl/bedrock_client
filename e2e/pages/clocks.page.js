// @ts-check

/**
 * Page Object: Relojes Legales (Legal Clocks)
 *
 * Legal clocks are NOT a standalone route. They are accessed via the FUN page
 * by clicking "Tiempos" in a license row's action popover menu. This opens a
 * modal with the clock/timeline view.
 *
 * Key components (from src/app/pages/user/fun_forms/fun_clock.js):
 * - centralClocks.component.js: Main clock container
 * - GanttChart: Visual timeline
 * - SidebarInfo: Clock details (days remaining, status, phases)
 * - ControlBar: Action buttons (suspend, resume, extend)
 * - AlarmsWidget: Alarm indicators
 * - ClockRow: Individual clock event rows
 *
 * The modal is a react-modal that opens over the FUN page.
 */
export class ClocksPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // The clock modal content (react-modal)
    this.modal = page.locator('.ReactModal__Content').last();

    // Clock event rows (ClockRow components or table rows within the modal)
    this.clockRows = this.modal.locator('[class*="clock-row"], tr, .row.border');

    // Visual timeline (GanttChart or the gantt container)
    this.ganttChart = this.modal.locator('[class*="gantt"], [class*="Gantt"], canvas, svg').first();

    // Sidebar info with days remaining, status, phases
    this.sidebarInfo = this.modal.locator('[class*="sidebar"], [class*="info"]').first();

    // Days or status labels
    this.daysLabel = this.modal.locator('text=/\\d+.*d[ií]a/i').first();
    this.statusLabel = this.modal.locator('text=/ACTIVO|PAUSADO|VENCIDO|FINALIZADO/i').first();

    // Control buttons within the modal
    this.suspendButton = this.modal.locator('button', { hasText: /suspend|suspen/i }).first();
    this.resumeButton = this.modal.locator('button', { hasText: /reanudar|resume/i }).first();

    // Close modal button
    this.closeButton = this.modal.locator('button', { hasText: /cerrar|close|x/i }).first();
  }

  /**
   * Open the clocks modal for a specific license from the FUN page.
   * Requires the FUN page to be loaded and the license visible in the table.
   *
   * @param {string} licenseId - The id_public visible in the DataTable (e.g. '68001-1-26-0001')
   */
  async openFromFunPage(licenseId) {
    // Click the action popover trigger in the matching row
    const row = this.page.locator('.rdt_TableRow', { hasText: licenseId });
    const actionToggle = row.locator('.fun-action-toggle');
    await actionToggle.click();

    // Click "Tiempos" in the popover
    const tiemposButton = this.page.locator('.fun-action-menu button', { hasText: /Tiempos/i });
    await tiemposButton.click();

    // Wait for the modal to open
    await this.modal.waitFor({ state: 'visible', timeout: 10_000 });
  }

  /** Check if the clock modal is visible */
  async isModalVisible() {
    return this.modal.isVisible();
  }

  /** Get the count of clock event rows */
  async getClockRowCount() {
    return this.clockRows.count();
  }

  /** Close the clock modal */
  async close() {
    await this.closeButton.click();
    await this.page.waitForTimeout(300);
  }
}
