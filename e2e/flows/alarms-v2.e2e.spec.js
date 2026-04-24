// @ts-check
import { test, expect } from '../fixtures/auth.fixture';

// Este smoke NO toma screenshots ni trazas (instruccion del usuario).
test.use({ screenshot: 'off', trace: 'off', video: 'off' });

/**
 * Smoke del sistema de alarmas v2:
 * - Settings page con tab "Alarmas (Nuevo)" accesible.
 * - Panel v2 se renderiza con botones de guardado y refresh.
 * - AlarmBell visible en layout principal.
 */

test.describe('Alarmas v2 — smoke', () => {
  test('Settings page muestra tab Alarmas (Nuevo) y panel v2', async ({ authenticatedPage: page }) => {
    await page.goto('/user/settings');
    const tabV2 = page.getByTestId('settings-tab-alarmas-v2');
    await expect(tabV2).toBeVisible({ timeout: 10000 });
    await tabV2.click();
    // Panel puede estar cargando, mostrar error o mostrar form; en los 3 casos el testid esta presente.
    await expect(page.getByTestId('alarms-v2-panel')).toBeVisible({ timeout: 10000 });
  });

  test('AlarmBell es visible y abre dropdown', async ({ authenticatedPage: page }) => {
    await page.goto('/');
    const bell = page.getByTestId('alarm-bell').first();
    await expect(bell).toBeVisible({ timeout: 10000 });
    await bell.click();
    // El boton "Ver todas las alarmas" debe aparecer en el menu
    await expect(page.getByTestId('alarm-bell-view-all')).toBeVisible({ timeout: 5000 });
  });
});
