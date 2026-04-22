// @ts-check
import { test, expect } from '../fixtures/auth.fixture';

const TABLE_ROWS = [
  {
    id: 501,
    fun0Id: 501,
    radicado: '2026-00501',
    fase_actual: 'EST',
    fase_label: 'Estudio y Observaciones',
    responsable: 'Curaduria',
    dias_habiles_usados: 5,
    dias_habiles_limite: 14,
    status: 'EN_TERMINO',
    porcentaje_avance: 48,
    categoria: 'Licencia',
    tipo_licencia: 'Construcción',
    tramite: 'Obra nueva',
    fecha_radicacion: '2026-04-01',
    fecha_limite: '2026-04-30',
    dias_habiles_totales: 20,
    isBookmarked: { personal: false },
  },
  {
    id: 502,
    fun0Id: 502,
    radicado: '2026-00502',
    fase_actual: 'CORR',
    fase_label: 'Correcciones del Solicitante',
    responsable: 'Solicitante',
    dias_habiles_usados: 2,
    dias_habiles_limite: 8,
    status: 'PRONTO_A_VENCER',
    porcentaje_avance: 62,
    categoria: 'Licencia',
    tipo_licencia: 'Reconocimiento',
    tramite: 'Ajuste',
    fecha_radicacion: '2026-04-05',
    fecha_limite: '2026-05-02',
    dias_habiles_totales: 18,
    isBookmarked: { personal: true },
  },
];

async function installFunmanageTableMocks(page) {
  await page.route('**/api/funmanage/dashboard/kpis**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        kpis: {
          total: 2,
          por_fase: [],
        },
      }),
    });
  });

  await page.route('**/api/funmanage/dashboard/chart-data**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ chartData: [] }),
    });
  });

  await page.route('**/api/funmanage/dashboard/table**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: TABLE_ROWS,
        total: TABLE_ROWS.length,
        page: 1,
        limit: 12,
      }),
    });
  });

  await page.route('**/api/funmanage/dashboard/expedientes**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: TABLE_ROWS }),
    });
  });

  await page.route('**/api/funmanage/alarms/config**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { configJson: { scatterThresholds: { warning: 80, critical: 95, overdue: 100 } } },
        }),
      });
      return;
    }

    await route.continue();
  });

  await page.route('**/api/funmanage/alarms**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
      return;
    }

    await route.continue();
  });

  await page.route('**/api/funmanage/bookmarks**', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [{ fun0Id: 502, scope: 'personal' }],
        }),
      });
      return;
    }

    if (method === 'POST') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
      return;
    }

    await route.continue();
  });

  await page.route('**/api/funmanage/bookmarks/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });

  await page.route('**/api/legal-guide/**', async (route) => {
    await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ message: 'Not found' }) });
  });
}

test.describe('Gestion Licencias v2 compact table', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await installFunmanageTableMocks(authenticatedPage);
    await authenticatedPage.goto('/licencias/gestion-nueva');
    await authenticatedPage.waitForLoadState('domcontentloaded');
    await expect(authenticatedPage.getByTestId('funmanage-table')).toBeVisible();
  });

  test('renders compact table without horizontal scroll at 1280x800', async ({ authenticatedPage }) => {
    await authenticatedPage.setViewportSize({ width: 1280, height: 800 });

    const scrollMetrics = await authenticatedPage.getByTestId('funmanage-table-scroll-container').evaluate((node) => ({
      scrollWidth: node.scrollWidth,
      clientWidth: node.clientWidth,
    }));

    expect(scrollMetrics.scrollWidth).toBe(scrollMetrics.clientWidth);
    await expect(authenticatedPage.getByRole('columnheader', { name: 'Estado' })).toBeVisible();
    await expect(authenticatedPage.getByTestId('row-preview-501')).toBeVisible();
    await expect(authenticatedPage.getByTestId('row-fullscreen-501')).toBeVisible();
  });

  test('row click opens preview drawer and explicit fullscreen action opens workspace', async ({ authenticatedPage }) => {
    await authenticatedPage.getByTestId('table-row-0').click();
    await expect(authenticatedPage.getByLabel('Detalle del expediente')).toBeVisible();
    await authenticatedPage.getByLabel('Cerrar panel').click();

    await expect(authenticatedPage.getByLabel('Detalle del expediente')).toBeHidden();

    await authenticatedPage.getByTestId('row-fullscreen-501').click();
    await expect(authenticatedPage.getByTestId('fun-expediente-workspace')).toBeVisible();
    await expect(authenticatedPage.getByLabel('Detalle del expediente')).toBeVisible();
    await expect(authenticatedPage.getByTestId('row-fullscreen-501')).toBeVisible();
  });

  test('bookmark and preview buttons remain visible in dark mode', async ({ authenticatedPage }) => {
    await authenticatedPage.emulateMedia({ colorScheme: 'dark' });
    await authenticatedPage.goto('/licencias/gestion-nueva');
    await authenticatedPage.waitForLoadState('domcontentloaded');
    await expect(authenticatedPage.getByTestId('funmanage-table')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid^="bookmark-toggle-"]').first()).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid^="row-preview-"]').first()).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid^="row-fullscreen-"]').first()).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid^="status-cur-value-"]').first()).toHaveText('5/14');
    await expect(authenticatedPage.locator('[data-testid^="status-sol-value-"]').first()).toHaveText('0/0');
  });
});
