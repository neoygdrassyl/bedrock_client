// @ts-check
import { test, expect } from '../fixtures/auth.fixture';

// Este smoke NO toma screenshots ni trazas (instruccion del usuario).
test.use({ screenshot: 'off', trace: 'off', video: 'off', viewport: { width: 1920, height: 1080 } });

/**
 * The alarm bell was removed from the shell and the "Alarmas" settings tab was
 * retired. These checks keep them from coming back by accident.
 */

test.describe('Alarmas — retiradas del shell y de Configuración', () => {
  test('Configuración ignora la pestaña retirada de alarmas', async ({ authenticatedPage: page }) => {
    await page.goto('/configuracion?tab=alarmas');
    await expect(page.getByTestId('settings-nav-cuenta')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('settings-nav-alarmas')).toHaveCount(0);
    await expect(page.getByTestId('alarms-v2-panel')).toHaveCount(0);
  });

  test('El shell no muestra la campana de alarmas', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('button', { name: /^Cuenta de / })).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('alarm-bell')).toHaveCount(0);
  });
});
