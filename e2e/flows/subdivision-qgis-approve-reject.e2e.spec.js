// @ts-check
import { test, expect, installE2EMocks } from '../fixtures/auth.fixture';
import { FunPage } from '../pages/fun.page';

/**
 * E2E para el flujo QGIS de subdivisión (import -> revisión -> aprobar/rechazar).
 *
 * Antes de este spec el flujo tenía cero cobertura automatizada (unit o e2e)
 * pese a haber producido 3 bugs reales en sesiones recientes: import
 * `useMemo` faltante (crash, ya corregido), panel vacío por desajuste de
 * versión, y DATETIME rechazado por MySQL al aprobar. Este test cubre el
 * camino feliz de UI para actuar como guarda de regresión sobre esos puntos:
 * el panel debe poblarse (no vacío/blanco) y la acción de aprobar debe
 * dejar el panel visible con el estado actualizado (no reemplazado por un
 * error genérico).
 *
 * Camino: /licencias -> expediente de subdivisión -> Inf. Arquitectónico
 * (mismo patrón probado en ph-report-workspace.e2e.spec.js / relojes-schedule-contract.e2e.spec.js).
 */

const SUBDIVISION_ID_PUBLIC = '68001-1-26-0003';

const PENDING_IMPORT = {
  import: {
    id: 9001,
    approval_status: 'pending',
    warnings: [],
    summary: { points_count: 2, lots_count: 1, preview_images_count: 0 },
  },
  payload: {
    points: [
      { id: 1, label: 'P1', x: 830125.42, y: 1180234.11, source_row_id: 'Lote 1' },
      { id: 2, label: 'P2', x: 830140.77, y: 1180250.63, source_row_id: 'Lote 1' },
    ],
    visualizations: [],
  },
};

const APPROVED_IMPORT = {
  ...PENDING_IMPORT,
  import: { ...PENDING_IMPORT.import, approval_status: 'approved' },
};

/** @param {import('@playwright/test').Page} page */
async function installQgisMocks(page) {
  let approveCalled = false;

  await page.route('**/api/subdivision-qgis/import/**/latest**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(approveCalled ? APPROVED_IMPORT : PENDING_IMPORT),
    });
  });

  await page.route(`**/api/subdivision-qgis/import/${PENDING_IMPORT.import.id}/approve`, async (route) => {
    approveCalled = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });
}

test.describe('E2E: Contrato QGIS de Subdivisión', () => {
  /** @type {FunPage} */
  let funPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    funPage = new FunPage(authenticatedPage);
    await authenticatedPage.setViewportSize({ width: 1920, height: 1080 });
    authenticatedPage.on('pageerror', (error) => {
      console.error('PAGE ERROR:', error.message);
    });
    authenticatedPage.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('CONSOLE ERROR:', msg.text());
      }
    });
  });

  test('abre el panel de import QGIS con datos poblados y aprobar deja el panel visible', async ({ authenticatedPage }) => {
    await funPage.goto();
    await authenticatedPage.waitForLoadState('domcontentloaded');
    await funPage.search(SUBDIVISION_ID_PUBLIC);

    const row = authenticatedPage.locator('.rdt_TableRow', { hasText: SUBDIVISION_ID_PUBLIC }).first();
    await expect(row).toBeVisible({ timeout: 15000 });
    await row.locator('.fun-action-toggle').click();

    const workspacePromise = authenticatedPage.context().waitForEvent('page');
    await authenticatedPage.locator('.fun-action-menu [role="menuitem"]', { hasText: /Inf\. Arquitectónico/i }).click();
    const workspacePage = await workspacePromise;

    // Critico: page.route() no se propaga a paginas nuevas abiertas via
    // window.open. Hay que reinstalar los mocks compartidos + los propios
    // de QGIS en la ventana del workspace, o cae al backend real.
    await installE2EMocks(workspacePage);
    await installQgisMocks(workspacePage);

    await workspacePage.waitForLoadState('domcontentloaded');
    await expect(workspacePage).toHaveURL(/\/funmanage\/expediente\/.+report=arquitectonico/);

    const panel = workspacePage.getByTestId('subdivision-qgis-panel');
    await expect(panel).toBeVisible({ timeout: 15000 });

    // Guarda contra el bug histórico de panel vacío: la tabla de puntos debe
    // mostrar filas reales, no el estado "aún no hay envíos" ni un blanco.
    await expect(panel.getByText('Aún no hay envíos QGIS')).toHaveCount(0);
    await expect(panel.getByText('P1')).toBeVisible();
    await expect(panel.getByText('P2')).toBeVisible();
    await expect(panel.getByText('Pendiente de aprobación').first()).toBeVisible();

    const approveButton = panel.locator('button', { hasText: 'Aprobar import' });
    await expect(approveButton).toBeVisible({ timeout: 15000 });
    await approveButton.click();

    // Tras aprobar, el panel sigue visible con datos (no un error genérico
    // reemplazando todo el contenido) y refleja el nuevo estado.
    await expect(panel).toBeVisible();
    await expect(panel.getByText('Aprobado por Dovela').first()).toBeVisible({ timeout: 10000 });
    await expect(panel.getByText('P1')).toBeVisible();
    await expect(panel.locator('[role="alert"]')).toHaveCount(0);

    await workspacePage.close();
  });
});
