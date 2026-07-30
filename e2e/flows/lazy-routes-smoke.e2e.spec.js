// @ts-check
import { test, expect } from '../fixtures/auth.fixture';

/**
 * E2E smoke: every React.lazy() route declared in src/app/App.js mounts
 * without throwing and without emitting console errors.
 *
 * Scope (Fase 3, plan 15-auditoria-post-migracion-react19.md item "Smoke de
 * rutas"): "todas las rutas lazy de App.js montan sin errores de consola
 * con datos reales". "Datos reales" here means the same realistic mocked
 * API responses the rest of the e2e suite uses (installE2EMocks via the
 * auth fixture) — there is no separate "real backend" mode for e2e.
 *
 * Explicitly OUT of scope: the /configuracion and /user/settings routes
 * render `SettingsPage`, which conditionally mounts `LegalConfigInitialPage`
 * (src/app/pages/user/legal_config/) only when the "configuracion-actuaciones"
 * tab is active. That module is mid-refactor with uncommitted local changes
 * as of this run, so this spec covers /configuracion at its DEFAULT tab
 * ("alarmas") only and never clicks into the legal-config tab.
 *
 * Duplicate route paths that resolve to the same lazy component
 * (/legal-flow-guide and /simulador/legal -> LEGAL_FLOW_GUIDE; /configuracion
 * and /user/settings -> SETTINGS) are each tested once via their primary path.
 */

test.use({ viewport: { width: 1920, height: 1080 } });

/** Text rendered by App.js's RouteErrorBoundary when a route subtree throws. */
const ERROR_BOUNDARY_TEXT = 'Error en este módulo';

/**
 * Public routes: reachable without auth, but still wrapped in
 * ShellAwarePublicRoute + Suspense around a lazy component.
 */
const PUBLIC_LAZY_ROUTES = [
  { path: '/normas', label: 'NORMS' },
  { path: '/certificados', label: 'CERTIFICATE_WORKER' },
  { path: '/uso-suelo', label: 'ZONE_USE' },
  { path: '/dev-guide', label: 'DEV_GUIDE' },
];

/**
 * Authenticated routes: rendered inside PrivateLayout (AppShell + Suspense).
 * Excludes /funmanage/expediente/:radicado (needs a real param, tested
 * separately below) and the legal_config-adjacent /configuracion tab content
 * (see file header).
 */
const PRIVATE_LAZY_ROUTES = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/licencias', label: 'FUN' },
  { path: '/licencias/gestion', label: 'FUN_MANAGE' },
  { path: '/licencias/gestion-nueva', label: 'FUN_MANAGE_NEW' },
  { path: '/peticiones', label: 'PQRSADMIN' },
  { path: '/ventanilla', label: 'SUBMIT' },
  { path: '/mensajes', label: 'Mail' },
  { path: '/calendario', label: 'Appointments' },
  { path: '/calendario-laboral', label: 'BusinessCalendarPage' },
  { path: '/archivo', label: 'ARCHIVE' },
  { path: '/publicaciones', label: 'Publish' },
  { path: '/nomenclatura', label: 'NOMENCLATURE' },
  { path: '/documentos', label: 'OSHA' },
  { path: '/simulador', label: 'SIMULADOR' },
  { path: '/simulador/documentos', label: 'DOCUMENTOS_SIMULATOR' },
  { path: '/simulador/legal', label: 'LEGAL_FLOW_GUIDE' },
  { path: '/calculadora', label: 'Liquidator' },
  { path: '/consecutivos', label: 'DICTIONARY' },
  { path: '/profesionales', label: 'PROFESIONALS' },
  { path: '/ayuda', label: 'GUIDE_USER' },
  { path: '/configuracion', label: 'SETTINGS (default tab, no legal_config)' },
  { path: '/sellos', label: 'Seals' },
];

/**
 * Wire console/pageerror diagnostics on a page and navigate to `path`,
 * waiting for the app to settle. Returns the collected diagnostics so the
 * caller can assert on them.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} path
 */
async function visitAndCollectDiagnostics(page, path) {
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    pageErrors.push(String(err));
  });

  await page.goto(path);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle').catch(() => {});
  // Give lazy chunks + Suspense fallback time to resolve.
  await page.waitForTimeout(500);

  if (pageErrors.length > 0) {
    console.log(`=== PAGE ERRORS on ${path} ===`, pageErrors);
  }
  if (consoleErrors.length > 0) {
    console.log(`=== CONSOLE ERRORS on ${path} ===`, consoleErrors);
  }

  return { consoleErrors, pageErrors };
}

test.describe('E2E: Lazy routes smoke (public)', () => {
  for (const { path, label } of PUBLIC_LAZY_ROUTES) {
    test(`${path} (${label}) mounts without console errors`, async ({ page }) => {
      const { consoleErrors, pageErrors } = await visitAndCollectDiagnostics(page, path);

      await expect(page.getByText(ERROR_BOUNDARY_TEXT)).toHaveCount(0);
      expect(pageErrors, `pageerror events on ${path}`).toEqual([]);
      expect(consoleErrors, `console.error messages on ${path}`).toEqual([]);
    });
  }
});

test.describe('E2E: Lazy routes smoke (authenticated)', () => {
  for (const { path, label } of PRIVATE_LAZY_ROUTES) {
    test(`${path} (${label}) mounts without console errors`, async ({ authenticatedPage }) => {
      const { consoleErrors, pageErrors } = await visitAndCollectDiagnostics(authenticatedPage, path);

      await expect(authenticatedPage.getByText(ERROR_BOUNDARY_TEXT)).toHaveCount(0);
      expect(pageErrors, `pageerror events on ${path}`).toEqual([]);
      expect(consoleErrors, `console.error messages on ${path}`).toEqual([]);
    });
  }

  test('/funmanage/expediente/:radicado (FUN_EXPEDIENTE_FULLSCREEN) mounts without console errors', async ({ authenticatedPage }) => {
    // id_public from E2E_FUN_RECORDS[0] in auth.fixture.js — matched by the
    // /fun/get/idpublic/:id mock.
    const radicado = '68001-1-26-0001';
    const { consoleErrors, pageErrors } = await visitAndCollectDiagnostics(
      authenticatedPage,
      `/funmanage/expediente/${radicado}`,
    );

    await expect(authenticatedPage.getByText(ERROR_BOUNDARY_TEXT)).toHaveCount(0);
    expect(pageErrors, 'pageerror events on /funmanage/expediente/:radicado').toEqual([]);
    expect(consoleErrors, 'console.error messages on /funmanage/expediente/:radicado').toEqual([]);
  });
});
