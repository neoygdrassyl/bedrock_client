// @ts-check
import { test, expect } from '../fixtures/auth.fixture';
import { FunPage } from '../pages/fun.page';

/**
 * E2E: Contrato real de "Programar Tiempos" (H-01).
 *
 * Antes de este fix, PUT /fun/schedule/:id no existia en el backend: cada
 * intento de guardar mostraba "Error al Guardar" y la programacion nunca
 * llegaba a persistirse (ni siquiera en localStorage, porque el guardado
 * local solo ocurria dentro del .then() de exito de la llamada al backend).
 * Este test ejercita el flujo real contra el backend real -- si el endpoint
 * vuelve a faltar o el contrato de datos se rompe, esto debe fallar.
 *
 * Camino: /funmanage -> expediente -> Tiempos -> Herramientas -> Programar Tiempos.
 */

async function ensureTabWithData(funPage, page) {
  await expect.poll(async () => {
    const processing = await page.locator('text=Procesando Formulario').isVisible().catch(() => false);
    const loading = await page.locator('text=CARGANDO...').isVisible().catch(() => false);
    const rows = await page.locator('.rdt_TableRow').count().catch(() => 0);
    const noData = await page.locator('text=NO HAY SOLICITUDES').isVisible().catch(() => false);
    return !processing && !loading && (rows > 0 || noData);
  }, { timeout: 20_000 }).toBe(true);

  let count = await page.locator('.fun-action-toggle:visible').count();
  if (count > 0) return true;

  for (const tab of ['evaluacion', 'expedicion', 'radicacion']) {
    await funPage.switchTab(tab);
    count = await page.locator('.fun-action-toggle:visible').count();
    if (count > 0) return true;
  }
  return false;
}

test.describe('E2E: Contrato de Programación de Tiempos', () => {
  /** @type {FunPage} */
  let funPage;
  test.beforeEach(async ({ authenticatedPage }) => {
    funPage = new FunPage(authenticatedPage);
  });

  test('guardar una programación de tiempos persiste contra el backend (no muestra Error al Guardar)', async ({ authenticatedPage }) => {
    await funPage.goto();
    await authenticatedPage.waitForLoadState('domcontentloaded');
    await expect.poll(async () => {
      const heading = authenticatedPage.locator('h1').filter({ hasText: /RADICACIÓN|FUN/i });
      return await heading.isVisible().catch(() => false);
    }, { timeout: 20_000 }).toBe(true);

    const hasData = await ensureTabWithData(funPage, authenticatedPage);
    if (!hasData) {
      test.skip(true, 'No hay expedientes disponibles para probar la programación de tiempos');
      return;
    }

    // Abrir el workspace de Tiempos en una pestaña nueva.
    const firstAction = authenticatedPage.locator('.fun-action-toggle:visible').first();
    await firstAction.click();
    const workspacePromise = authenticatedPage.context().waitForEvent('page');
    await authenticatedPage.locator('.fun-action-menu [role="menuitem"]', { hasText: /Tiempos/i }).click();
    const workspacePage = await workspacePromise;
    await workspacePage.waitForLoadState('domcontentloaded');
    await expect(workspacePage).toHaveURL(/\/funmanage\/expediente\/.+section=tiempos/);

    // Abrir el menú de Herramientas y elegir "Programar Tiempos".
    const toolsFab = workspacePage.locator('button[title="Herramientas"]');
    await expect(toolsFab).toBeVisible({ timeout: 15_000 });
    await toolsFab.click();
    await workspacePage.locator('.tools-menu-item', { hasText: /Programar Tiempos/i }).click();

    // Esperar el modal de programación (SweetAlert2 con el contenido real de ScheduleModal).
    const scheduleModal = workspacePage.locator('.schedule-modal-layout');
    await expect(scheduleModal).toBeVisible({ timeout: 10_000 });

    const noSchedulable = await scheduleModal.locator('text=No hay tiempos programables disponibles').isVisible().catch(() => false);
    if (noSchedulable) {
      test.skip(true, 'El expediente elegido no tiene tiempos programables en su estado actual');
      return;
    }

    // Programar el primer tiempo disponible por días hábiles.
    const firstDaysInput = scheduleModal.locator('input[type="number"][placeholder="Días"]').first();
    await expect(firstDaysInput).toBeVisible();
    await firstDaysInput.fill('5');

    // Confirmar guardado.
    await workspacePage.locator('.swal2-confirm', { hasText: /Guardar Programación/i }).click();

    // Debe mostrar éxito, NUNCA el error de guardado (eso era el bug: PUT /fun/schedule/:id 404).
    await expect(workspacePage.locator('.swal2-popup', { hasText: /Error al Guardar/i })).not.toBeVisible({ timeout: 5_000 });
    await expect(workspacePage.locator('.swal2-popup', { hasText: /Programación Guardada/i })).toBeVisible({ timeout: 10_000 });
  });
});
