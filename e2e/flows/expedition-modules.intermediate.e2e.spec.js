// @ts-check
import { test, expect, installE2EMocks } from '../fixtures/auth.fixture';
import { FunPage } from '../pages/fun.page';

/**
 * E2E intermedio:
 * 1) abrir /fun
 * 2) ir a tab de expedicion y abrir un proyecto
 * 3) entrar a Expedicion — desde aab49680 (2026-04-27) esto ya NO abre un
 *    react-modal: `openFullscreenWorkspace(row, 'expedition')` hace
 *    `window.open(...)` hacia `/funmanage/expediente/:radicado?section=expedicion`,
 *    que renderiza `FunExpedienteFullscreen` (dialog fullscreen) en una pestaña nueva.
 * 4) en la pestaña nueva, descubrir dinámicamente TODOS los botones de módulo
 *    disponibles en `nav[aria-label="Módulos del expediente"]` y recorrerlos uno
 *    a uno. A diferencia del viejo patrón de modal-swap, aquí el diálogo permanece
 *    montado: la señal de espera confiable es que el botón clickeado adquiera
 *    `aria-current="page"` (ver SectionButton en FunExpedienteFullscreen.jsx).
 *    El loop se detiene cuando no quedan botones no visitados.
 * 5) verificar que no se rompa la app (sin page errors)
 */

test.describe('E2E: Flujo Intermedio Expedition', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

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

    /** Wire diagnostic listeners onto any page (main tab or the fullscreen workspace tab). */
    const wireDiagnostics = (targetPage) => {
      targetPage.on('pageerror', (err) => {
        pageErrors.push(String(err));
        console.log('=== PAGE ERROR ===', String(err));
      });

      targetPage.on('console', (msg) => {
        const entry = { type: msg.type(), text: msg.text() };
        if (msg.type() === 'error') {
          consoleErrors.push(entry);
          console.log('=== CONSOLE ERROR ===', entry.text);
        } else if (msg.type() === 'warning') {
          consoleWarnings.push(entry);
        } else if (msg.text().includes('FUN_ALERT retrieveItem')) {
          console.log('--- DEBUG FUN_ALERT currentItem:', msg.text());
        } else if (msg.text().includes('NAV GROUPS GENERATED')) {
          console.log(msg.text());
        }
      });

      targetPage.on('requestfailed', (request) => {
        requestFailures.push({
          method: request.method(),
          url: request.url(),
          failure: request.failure()?.errorText ?? 'unknown',
        });
      });
    };

    wireDiagnostics(authenticatedPage);

    // `workspacePage` starts as the main tab and is reassigned once the fullscreen
    // workspace opens in a new tab; all "current UI" helpers below read from it.
    let workspacePage = authenticatedPage;

    const maybeAttachDiagnostics = async (reason) => {
      const screenshotPath = testInfo.outputPath('expedition-debug.png');
      const diagnostics = {
        reason,
        step: currentStep.label,
        url: workspacePage.url(),
        pageErrors,
        consoleErrors,
        consoleWarnings,
        requestFailures,
        nonFatalAlerts,
      };

      await workspacePage.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
      const html = await workspacePage.content().catch(() => '<html><body>No HTML available</body></html>');
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
        const fallbackPng = await workspacePage.screenshot({ fullPage: true }).catch(() => null);
        if (fallbackPng) {
          await testInfo.attach('expedition-debug-fallback.png', {
            body: fallbackPng,
            contentType: 'image/png',
          });
        }
      });
      await testInfo.attach('expedition-debug-url.txt', {
        body: Buffer.from(`${workspacePage.url()}\n`, 'utf8'),
        contentType: 'text/plain',
      });
    };

    /**
     * "Pantalla en blanco" for the fullscreen workspace: the dialog mounted but
     * exposes no actionable UI (no visible module nav, no buttons, no text).
     */
    const detectWhiteScreenCrash = async () => {
      const root = workspacePage.locator('#root');
      const hasRoot = await root.count().catch(() => 0);
      if (!hasRoot) return true;

      const rootVisible = await root.first().isVisible().catch(() => false);
      if (!rootVisible) return true;

      const hasWorkspaceDialog = await workspacePage
        .locator('[role="dialog"][aria-label="Detalle del expediente"]:visible')
        .count()
        .catch(() => 0);
      const hasAnyButton = await workspacePage.locator('button:visible').count().catch(() => 0);
      const hasWorkspaceNav = await workspacePage
        .locator('nav[aria-label="Módulos del expediente"]:visible button')
        .count()
        .catch(() => 0);

      const bodyTextLength = await workspacePage.locator('body').innerText().then((t) => t.trim().length).catch(() => 0);

      // Once the workspace tab exists, it must show its dialog + nav; on the main
      // tab (before the workspace opens) any button/text presence is enough.
      if (hasWorkspaceDialog > 0 || hasWorkspaceNav > 0) return false;
      return hasAnyButton === 0 && bodyTextLength < 20;
    };

    const assertNotWhiteScreen = async (stepLabel) => {
      currentStep.label = stepLabel;
      const crashed = await detectWhiteScreenCrash();
      if (crashed) {
        await maybeAttachDiagnostics(`White screen crash detected at step: ${stepLabel}`);
        throw new Error(`UI crash: pantalla en blanco detectada en "${stepLabel}"`);
      }
    };

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

    // Entrar al modulo de Expedicion desde el proyecto: abre una pestaña nueva
    // (window.open) hacia el workspace fullscreen en lugar de un react-modal.
    currentStep.label = 'abrir workspace de expedicion (pestaña nueva)';
    const [newTab] = await Promise.all([
      authenticatedPage.context().waitForEvent('page'),
      popoverMenu.locator('[role="menuitem"]', { hasText: /Expedici/i }).click(),
    ]);

    // Los mocks de red se registran por página; instalarlos antes de esperar la
    // carga para interceptar los fetch/xhr que dispara el montaje del workspace.
    await installE2EMocks(newTab);
    wireDiagnostics(newTab);
    workspacePage = newTab;

    await newTab.waitForLoadState('domcontentloaded');

    // Esperar a que el dialog fullscreen del expediente aparezca.
    await expect(newTab.locator('[role="dialog"][aria-label="Detalle del expediente"]'))
      .toBeVisible({ timeout: 20_000 });
    await assertNotWhiteScreen('workspace fullscreen de expedicion abierto');

    // Si no existe expediente aun, generarlo en blanco para estabilizar el flujo.
    const generateBlankExpedition = newTab.locator('button', { hasText: /GENERAR EXPEDICI[OÓ]N( P\.H\.)? EN BLANCO/i });
    if (await generateBlankExpedition.isVisible().catch(() => false)) {
      await generateBlankExpedition.click();
      await newTab.waitForTimeout(500);
    }

    /** Dismiss any SweetAlert2 popup that may appear. */
    const dismissAnySwal = async () => {
      const swalContainer = newTab.locator('.swal2-container:visible').first();
      if (await swalContainer.isVisible().catch(() => false)) {
        const swalText = await swalContainer.innerText().catch(() => '');
        if (nonFatalAlertRegex.some((re) => re.test(swalText))) {
          nonFatalAlerts.push(swalText.trim());
        }

        const enabledConfirmBtn = newTab.locator('.swal2-confirm:visible:not([disabled])').first();
        if (await enabledConfirmBtn.isVisible().catch(() => false)) {
          await enabledConfirmBtn.click();
        } else {
          await swalContainer.waitFor({ state: 'hidden', timeout: 4_000 }).catch(async () => {
            await newTab.keyboard.press('Escape');
          });
        }
      }
    };

    await dismissAnySwal();

    // Recorrido dinámico: descubre todos los botones de módulo disponibles en
    // `nav[aria-label="Módulos del expediente"]` y los visita uno a uno. El set
    // visitedLabels evita ciclos. Como el dialog permanece montado (no hay
    // modal-swap), la señal de espera confiable tras cada click es que el botón
    // adquiera `aria-current="page"`.
    const visitedLabels = new Set();
    const allDiscoveredLabels = new Set();
    const workspaceNav = newTab.locator('nav[aria-label="Módulos del expediente"]');

    const clickAllAvailableModules = async () => {
      let keepGoing = true;

      while (keepGoing) {
        await dismissAnySwal();

        // Registrar todos los botones que aparecen en el nav (incluso el activo)
        // para validar cobertura total. El botón activo (aria-current=page) ya
        // fue "visitado" por definición — su contenido está montado y visible —
        // aunque nunca se haya clickeado (p.ej. "Expedición" al abrir el workspace).
        const visibleItems = workspaceNav.locator('button:visible');
        const visibleCount = await visibleItems.count();
        for (let i = 0; i < visibleCount; i++) {
          const item = visibleItems.nth(i);
          const label = await item.getAttribute('aria-label');
          if (!label) continue;
          allDiscoveredLabels.add(label);
          const isActive = (await item.getAttribute('aria-current')) === 'page';
          if (isActive) visitedLabels.add(label);
        }

        // Botones clickeables: excluye el que ya está activo (aria-current=page).
        const clickableItems = workspaceNav.locator('button:visible:not([aria-current="page"])');

        let clicked = false;
        const count = await clickableItems.count();

        for (let i = 0; i < count; i++) {
          const btn = clickableItems.nth(i);
          const label = await btn.getAttribute('aria-label');

          if (label && !visitedLabels.has(label)) {
            visitedLabels.add(label);

            await dismissAnySwal();
            currentStep.label = `click nav item: ${label}`;
            await btn.click();

            await newTab.waitForTimeout(350);
            await dismissAnySwal();

            // La app no debe quedar en pantalla en blanco tras el click.
            await expect.poll(async () => !(await detectWhiteScreenCrash()), {
              timeout: 15_000,
            }).toBe(true);

            // El botón clickeado debe quedar marcado como módulo activo.
            const clickedButton = workspaceNav.locator('button', { hasText: label }).first();
            const clickedByAriaLabel = workspaceNav.locator(`button[aria-label="${label}"]`).first();
            const activeCandidate = (await clickedByAriaLabel.count()) > 0 ? clickedByAriaLabel : clickedButton;
            if (await activeCandidate.isVisible().catch(() => false)) {
              await expect(activeCandidate).toHaveAttribute('aria-current', 'page', { timeout: 10_000 });
            }

            await assertNotWhiteScreen(`post-click ${label}`);

            clicked = true;
            break; // vuelve a escanear el nav recién actualizado
          }
        }

        if (!clicked) keepGoing = false; // todos los disponibles fueron visitados
      }

      // Validación: asegurar que visitamos todo lo que alguna vez vimos.
      // Si un módulo rompe el nav y oculta los demás, esto detiene el silencio del test.
      const missed = Array.from(allDiscoveredLabels).filter((l) => !visitedLabels.has(l));
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
