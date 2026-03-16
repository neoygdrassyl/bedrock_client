// @ts-check
import { test, expect } from '../fixtures/auth.fixture';
import { FunPage } from '../pages/fun.page';

/**
 * E2E intermedio:
 * 1) abrir /fun
 * 2) ir a tab de expedicion y abrir un proyecto
 * 3) entrar a Expedicion
 * 4) navegar secuencialmente por submodulos (DETALLES, TIEMPOS, DOCUMENTOS)
 *    usando la sidebar (.fun-nav-item) — cada click cierra el modal actual
 *    y abre otro (modal-swap pattern de fun.js#navigation)
 * 5) volver a EXPEDICION al final
 * 6) verificar que no se rompa la app (sin page errors)
 */

test.describe('E2E: Flujo Intermedio Expedition', () => {
  test('abre proyecto de expedicion y recorre modulos secuencialmente sin romper la app', async ({ authenticatedPage }) => {
    const funPage = new FunPage(authenticatedPage);
    const pageErrors = [];

    authenticatedPage.on('pageerror', (err) => {
      pageErrors.push(String(err));
    });

    await funPage.goto();
    await funPage.waitForPageLoad();
    await funPage.waitForTable();

    // Moverse a la pestaña Expedicion para abrir un proyecto en ese estado.
    await funPage.switchTab('expedicion');
    await funPage.waitForTable();

    const actionCount = await funPage.getActionToggleCount();
    expect(actionCount).toBeGreaterThan(0);

    // Abrir menu de acciones de la primera fila visible.
    const firstActionToggle = authenticatedPage.locator('.fun-action-toggle:visible').first();
    await firstActionToggle.click();

    const popoverMenu = authenticatedPage.locator('.fun-action-menu');
    await expect(popoverMenu).toBeVisible();

    // Entrar al modulo de Expedicion desde el proyecto.
    await popoverMenu.locator('button', { hasText: /Expedici/i }).click();

    // Esperar a que el modal de expedition aparezca.
    await expect(authenticatedPage.locator('.ReactModal__Content:visible').first())
      .toBeVisible({ timeout: 20_000 });

    // Si no existe expediente aun, generarlo en blanco para estabilizar el flujo.
    const generateBlankExpedition = authenticatedPage.locator('button', { hasText: /GENERAR EXPEDICION EN BLANCO/i });
    if (await generateBlankExpedition.isVisible().catch(() => false)) {
      await generateBlankExpedition.click();
      await authenticatedPage.waitForTimeout(500);
    }

    /** Dismiss any SweetAlert2 popup that may appear. */
    const dismissAnySwal = async () => {
      const swalContainer = authenticatedPage.locator('.swal2-container:visible').first();
      if (await swalContainer.isVisible().catch(() => false)) {
        const enabledConfirmBtn = authenticatedPage.locator('.swal2-confirm:visible:not([disabled])').first();
        if (await enabledConfirmBtn.isVisible().catch(() => false)) {
          await enabledConfirmBtn.click();
        } else {
          await swalContainer.waitFor({ state: 'hidden', timeout: 4_000 }).catch(async () => {
            await authenticatedPage.keyboard.press('Escape');
          });
        }
      }
    };

    await dismissAnySwal();

    // Recorrido secuencial: navegar a cada submodulo via sidebar.
    // Cada click cierra el modal actual y abre otro (modal-swap).
    const moduleLabels = [
      /DETALLES/i,
      /TIEMPOS/i,
      /DOCUMENTOS/i,
      /EXPEDICI[ÓO]N/i,
    ];

    for (const labelRegex of moduleLabels) {
      const button = authenticatedPage.locator('.fun-nav-item:visible', { hasText: labelRegex }).first();
      const canClick = await button.isVisible().catch(() => false);
      if (!canClick) {
        continue;
      }

      const isDisabled = await button.isDisabled().catch(() => false);
      if (isDisabled) {
        continue;
      }

      await dismissAnySwal();
      await button.click();

      // Esperar a que el nuevo modal se abra (modal-swap: cierra uno, abre otro).
      await expect(authenticatedPage.locator('.ReactModal__Content:visible').first())
        .toBeVisible({ timeout: 20_000 });

      // Esperar a que la sidebar del nuevo modal este disponible (confirma render completo).
      await expect(authenticatedPage.locator('.fun-nav-sidebar:visible').first())
        .toBeVisible({ timeout: 10_000 });

      await dismissAnySwal();
    }

    expect(pageErrors).toEqual([]);
  });
});
