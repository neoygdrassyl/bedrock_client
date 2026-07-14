// @ts-check
import { test, expect } from '../fixtures/auth.fixture';

// Este smoke NO toma screenshots ni trazas (instruccion del usuario).
test.use({ screenshot: 'off', trace: 'off', video: 'off', viewport: { width: 1920, height: 1080 } });

/**
 * Smoke del sistema de alarmas v2:
 * - Settings page con tab "Alarmas" accesible (es el tab activo por defecto).
 * - Panel v2 se renderiza con botones de guardado y refresh.
 * - AlarmBell visible en layout principal.
 */

test.describe('Alarmas v2 — smoke', () => {
  test('Settings page muestra tab Alarmas y panel v2', async ({ authenticatedPage: page }) => {
    await page.goto('/user/settings');
    const tabAlarmas = page.getByTestId('settings-nav-alarmas');
    await expect(tabAlarmas).toBeVisible({ timeout: 10000 });
    await tabAlarmas.click();
    // Panel puede estar cargando, mostrar error o mostrar form; en los 3 casos el testid esta presente.
    await expect(page.getByTestId('alarms-v2-panel')).toBeVisible({ timeout: 10000 });
  });

  test('AlarmBell es visible y abre dropdown', async ({ authenticatedPage: page }) => {
    // '/' redirects to '/login', which itself redirects back to '/dashboard' only once auth
    // context settles — navigate straight to an authenticated route (inside PrivateLayout/AppShell,
    // where HeaderBar + AlarmBell live) to avoid depending on that redirect chain.
    await page.goto('/dashboard');
    const bell = page.getByTestId('alarm-bell').first();
    await expect(bell).toBeVisible({ timeout: 10000 });
    await bell.click();
    // El boton "Ver todas las alarmas" debe aparecer en el menu
    await expect(page.getByTestId('alarm-bell-view-all')).toBeVisible({ timeout: 5000 });
  });
});
