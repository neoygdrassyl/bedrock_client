// @ts-check
import { test, expect } from '../fixtures/auth.fixture';

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
      body: JSON.stringify({ data: [], total: 0, page: 1, limit: 12 }),
    });
  });

  await page.route('**/api/funmanage/dashboard/expedientes**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
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
          data: [],
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

test.describe('Gestion Licencias Nuevo development state', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await installFunmanageTableMocks(authenticatedPage);
    await authenticatedPage.goto('/licencias/gestion-nueva');
    await authenticatedPage.waitForLoadState('domcontentloaded');
    await expect(authenticatedPage.getByTestId('gestion-nueva-development-state')).toBeVisible();
  });

  test('renders the intentional closed-state surface at 1280x800', async ({ authenticatedPage }) => {
    await authenticatedPage.setViewportSize({ width: 1280, height: 800 });

    await expect(authenticatedPage.getByText('Gestión Licencias Nuevo está en desarrollo')).toBeVisible();
    await expect(authenticatedPage.getByText('Esta superficie permanece cerrada')).toBeVisible();
    await expect(authenticatedPage.getByRole('link', { name: 'Abrir gestión clásica' })).toBeVisible();
    await expect(authenticatedPage.getByRole('link', { name: 'Volver al dashboard' })).toBeVisible();
  });

  test('closed-state actions remain visible in dark mode', async ({ authenticatedPage }) => {
    await authenticatedPage.emulateMedia({ colorScheme: 'dark' });
    await authenticatedPage.goto('/licencias/gestion-nueva');
    await authenticatedPage.waitForLoadState('domcontentloaded');
    await expect(authenticatedPage.getByTestId('gestion-nueva-development-state')).toBeVisible();
    await expect(authenticatedPage.getByRole('link', { name: 'Abrir gestión clásica' })).toBeVisible();
  });
});
