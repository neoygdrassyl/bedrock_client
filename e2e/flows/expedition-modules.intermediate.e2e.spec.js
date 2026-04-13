// @ts-check
import { test, expect } from '../fixtures/auth.fixture';
import { FunPage } from '../pages/fun.page';

/**
 * E2E intermedio:
 * 1) abrir /fun
 * 2) ir a tab de expedicion y abrir un proyecto
 * 3) entrar a Expedicion
 * 4) descubrir dinámicamente TODOS los nav-items disponibles en el sidebar y
 *    recorrerlos uno a uno (modal-swap pattern de fun.js#navigation).
 *    La señal de espera confiable es que el item clickeado aparezca como
 *    `disabled` en el nuevo modal (indica que montó y lo marcó como activo).
 *    El loop se detiene cuando no quedan items no visitados.
 * 5) verificar que no se rompa la app (sin page errors)
 */

test.describe('E2E: Flujo Intermedio Expedition', () => {
  test('abre proyecto de expedicion y recorre modulos secuencialmente sin romper la app', async ({ authenticatedPage }, testInfo) => {
    const funPage = new FunPage(authenticatedPage);
    const pageErrors = [];
    const consoleErrors = [];
    const consoleWarnings = [];
    const requestFailures = [];
    const nonFatalAlerts = [];

    const nonFatalAlertRegex = [
      /error\s+al\s+cargar/i,
      /sin\s+informaci[oó]n/i,
      /no\s+hay\s+informaci[oó]n/i,
      /no\s+existe/i,
      /faltan\s+datos/i,
    ];

    const currentStep = { label: 'setup' };

    const maybeAttachDiagnostics = async (reason) => {
      const screenshotPath = testInfo.outputPath('expedition-debug.png');
      const htmlPath = testInfo.outputPath('expedition-debug.html');
      const diagnostics = {
        reason,
        step: currentStep.label,
        url: authenticatedPage.url(),
        pageErrors,
        consoleErrors,
        consoleWarnings,
        requestFailures,
        nonFatalAlerts,
      };

      await authenticatedPage.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
      const html = await authenticatedPage.content().catch(() => '<html><body>No HTML available</body></html>');
      await testInfo.attach('expedition-diagnostics.json', {
        body: Buffer.from(JSON.stringify(diagnostics, null, 2), 'utf8'),
        contentType: 'application/json',
      });
      await testInfo.attach('expedition-debug.html', {
        body: Buffer.from(html, 'utf8'),
        contentType: 'text/html',
      });
      await testInfo.attach('expedition-debug.png', {
        path: screenshotPath,
        contentType: 'image/png',
      }).catch(async () => {
        const fallbackPng = await authenticatedPage.screenshot({ fullPage: true }).catch(() => null);
        if (fallbackPng) {
          await testInfo.attach('expedition-debug-fallback.png', {
            body: fallbackPng,
            contentType: 'image/png',
          });
        }
      });
      await testInfo.attach('expedition-debug-url.txt', {
        body: Buffer.from(`${authenticatedPage.url()}\n`, 'utf8'),
        contentType: 'text/plain',
      });

      // Keep local file write for quick local inspection while preserving attachments.
      await testInfo.attach('expedition-debug-paths.txt', {
        body: Buffer.from(`screenshot: ${screenshotPath}\nhtml: ${htmlPath}\n`, 'utf8'),
        contentType: 'text/plain',
      });
    };

    const detectWhiteScreenCrash = async () => {
      const root = authenticatedPage.locator('#root');
      const hasRoot = await root.count().catch(() => 0);
      if (!hasRoot) return true;

      const rootVisible = await root.first().isVisible().catch(() => false);
      if (!rootVisible) return true;

      const hasAnyModal = await authenticatedPage.locator('.ReactModal__Content:visible').count().catch(() => 0);
      const hasAnyButton = await authenticatedPage.locator('button:visible').count().catch(() => 0);
      const hasAnySidebarNav = await authenticatedPage.locator('.fun-nav-sidebar:visible .fun-nav-item').count().catch(() => 0);

      const bodyTextLength = await authenticatedPage.locator('body').innerText().then((t) => t.trim().length).catch(() => 0);

      // A practical definition of "pantalla en blanco": app mounted but with no actionable UI.
      return hasAnyModal === 0 && hasAnyButton === 0 && hasAnySidebarNav === 0 && bodyTextLength < 20;
    };

    const assertNotWhiteScreen = async (stepLabel) => {
      currentStep.label = stepLabel;
      const crashed = await detectWhiteScreenCrash();
      if (crashed) {
        await maybeAttachDiagnostics(`White screen crash detected at step: ${stepLabel}`);
        throw new Error(`UI crash: pantalla en blanco detectada en "${stepLabel}"`);
      }
    };

    authenticatedPage.on('pageerror', (err) => {
      pageErrors.push(String(err));
    });

    authenticatedPage.on('console', (msg) => {
      const entry = {
        type: msg.type(),
        text: msg.text(),
      };
      if (msg.type() === 'error') {
        consoleErrors.push(entry);
        console.log("=== CONSOLE ERROR ===", entry.text);
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(entry);
      } else if (msg.text().includes('FUN_ALERT retrieveItem')) {
        console.log('--- DEBUG FUN_ALERT currentItem:', msg.text());
      } else if (msg.text().includes('NAV GROUPS GENERATED')) {
        console.log(msg.text());
      }
    });

    authenticatedPage.on('pageerror', (err) => {
      pageErrors.push(String(err));
      console.log("=== PAGE ERROR ===", String(err));
    });

    authenticatedPage.on('requestfailed', (request) => {
      requestFailures.push({
        method: request.method(),
        url: request.url(),
        failure: request.failure()?.errorText ?? 'unknown',
      });
    });

    await funPage.goto();
    await funPage.waitForPageLoad();
    await funPage.waitForTable();
    await assertNotWhiteScreen('pagina FUN cargada');

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
    await assertNotWhiteScreen('modal expedition abierto');

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
        const swalText = await swalContainer.innerText().catch(() => '');
        if (nonFatalAlertRegex.some((re) => re.test(swalText))) {
          nonFatalAlerts.push(swalText.trim());
        }

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

    // Recorrido dinámico: descubre todos los nav-items disponibles en el
    // sidebar activo y los visita uno a uno. El set visitedLabels evita ciclos.
    // La señal de espera confiable tras cada modal-swap es que el item clickeado
    // aparezca como `disabled` (fun_moduleNav.js lo deshabilita cuando es el activo),
    // en lugar de simplemente esperar que haya "algún modal visible" (lo cual pasa
    // inmediatamente con el modal VIEJO todavía animando su cierre).
    const visitedLabels = new Set();
    const allDiscoveredLabels = new Set();

    const clickAllAvailableModules = async () => {
      let keepGoing = true;

      while (keepGoing) {
        await dismissAnySwal();

        // Registrar todos los ítems que aparecen en el sidebar (incluso inactivos) para validar cobertura total
        const visibleItems = authenticatedPage.locator(
          '.fun-nav-sidebar:visible .fun-nav-item:not(.btn-close-module)'
        );
        const visibleCount = await visibleItems.count();
        if (visibleCount > 0) {
          for (let i = 0; i < visibleCount; i++) {
            const lbl = (await visibleItems.nth(i).textContent())?.trim() ?? '';
            if (lbl) allDiscoveredLabels.add(lbl);
          }
        }

        // Items clickeables: excluye el botón CERRAR y los ya activos (disabled).
        const clickableItems = authenticatedPage.locator(
          '.fun-nav-sidebar:visible .fun-nav-item:not(.btn-close-module):not([disabled])'
        );

        let clicked = false;
        const count = await clickableItems.count();

        for (let i = 0; i < count; i++) {
          const btn = clickableItems.nth(i);
          const label = (await btn.textContent())?.trim() ?? '';

          if (label && !visitedLabels.has(label)) {
            visitedLabels.add(label);

            await dismissAnySwal();
            currentStep.label = `click nav item: ${label}`;
            await btn.click();

            // Algunos módulos hacen modal-swap y otros no. Esperar estabilidad y
            // verificar que la UI siga operativa.
            await authenticatedPage.waitForTimeout(350);
            await dismissAnySwal();

            // Tras el click puede permanecer modal, cambiar módulo o salir del flujo.
            // Lo que sí debe cumplirse: la app no debe quedar en pantalla en blanco.
            await expect.poll(async () => !(await detectWhiteScreenCrash()), {
              timeout: 15_000,
            }).toBe(true);

            // Si el mismo label existe tras el click, idealmente debe quedar activo (disabled).
            const targetInNewSidebar = authenticatedPage.locator(
              '.fun-nav-sidebar:visible .fun-nav-item',
              { hasText: label }
            ).first();
            if (await targetInNewSidebar.isVisible().catch(() => false)) {
              await expect(targetInNewSidebar).toBeDisabled({ timeout: 10_000 });
            }

            await assertNotWhiteScreen(`post-swap ${label}`);

            clicked = true;
            break; // vuelve a escanear el sidebar recién montado
          }
        }

        if (!clicked) keepGoing = false; // todos los disponibles fueron visitados
      }
      
      // Validación: asegurar que visitamos todo lo que alguna vez vimos.
      // Si un módulo (ej. PUBLICIDAD) rompe el sidebar y oculta los demás, 
      // esto detiene el silencio del test.
      const missed = Array.from(allDiscoveredLabels).filter(l => !visitedLabels.has(l));
      if (missed.length > 0) {
        throw new Error(`Flujo incompleto: se descubrieron estos módulos pero desaparecieron antes de visitarlos: ${missed.join(', ')}`);
      }
    };

    await clickAllAvailableModules();

    if (pageErrors.length > 0 || consoleErrors.length > 0) {
      await maybeAttachDiagnostics('JS runtime errors detected during flow');
    }

    expect(pageErrors).toEqual([]);
  });
});
