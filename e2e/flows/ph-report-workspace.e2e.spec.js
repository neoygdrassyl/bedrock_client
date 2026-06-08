// @ts-check
import { test, expect, installE2EMocks } from '../fixtures/auth.fixture';

/**
 * E2E para validar los fixes del flujo de Informe P.H. (Propiedad Horizontal)
 * Bugs cubiertos:
 * 1. Focus loss al escribir en inputs del submódulo PH (record_ph_gen.component.js)
 * 2. Menú de acciones abre viejo modal en vez del workspace (fun.js -> openFullscreenWorkspace)
 * 3. Cierre del modal redirige al dashboard en vez de volver a la lista (record_ph.js closeModal)
 * 4. Expedición desde un expediente PH abre la vista nueva y no el modal legacy EXPEDITION
 */
test.describe('E2E: Flujo de Informe P.H. — fixes de UX y navegación', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.setViewportSize({ width: 1920, height: 1080 });
    authenticatedPage.on('pageerror', (error) => {
      console.error('PAGE ERROR:', error.message);
    });
    authenticatedPage.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('CONSOLE ERROR:', msg.text());
      }
    });
  });

  test('Bug 2 — abrir Informe P.H. desde menú de acciones abre el workspace (no el viejo modal)', async ({ authenticatedPage }) => {
    // 1. Ir a la lista de licencias y cambiar a la pestaña "Otras Actuaciones"
    await authenticatedPage.goto('/licencias');
    await authenticatedPage.waitForLoadState('domcontentloaded');
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.waitForTimeout(1000);

    // Esperar a que las pestañas carguen (incluyendo el contador del badge)
    await authenticatedPage.waitForSelector('button[role="tab"]', { timeout: 30000 });
    const otrasActuacionesTab = authenticatedPage.locator('button[role="tab"]').filter({ hasText: /Otras Actuaciones/i });
    await expect(otrasActuacionesTab).toBeVisible({ timeout: 15000 });
    await otrasActuacionesTab.click();
    await authenticatedPage.waitForTimeout(500);

    // 2. Localizar la fila del expediente PH conocido por su radicado
    const phRow = authenticatedPage.locator('table tbody tr').filter({
      has: authenticatedPage.getByText('68001-1-26-0001', { exact: false }),
    }).first();
    await expect(phRow).toBeVisible({ timeout: 15000 });

    // 3. Abrir el menú de acciones (⋯)
    const actionMenuBtn = phRow.locator('button').last();
    await actionMenuBtn.click();

    // 4. Click en "Inf. P.H."
    const phMenuItem = authenticatedPage.getByRole('menuitem', { name: /Inf\. P\.H\./i });
    await expect(phMenuItem).toBeVisible();

    // 5. Esperar que se abra una nueva pestaña con el workspace
    const [newPage] = await Promise.all([
      authenticatedPage.waitForEvent('popup'),
      phMenuItem.click(),
    ]);

    // El popup también necesita los mocks para cargar el workspace correctamente
    await installE2EMocks(newPage);
    await newPage.waitForLoadState('domcontentloaded');
    await newPage.waitForTimeout(1500);

    // 6. Validar que estamos en el workspace y NO en un modal legacy
    await expect(newPage).toHaveURL(/\/funmanage\/expediente\/.*\?section=informes&report=ph/);
    await expect(newPage.getByRole('dialog', { name: /Detalle del expediente/i })).toBeVisible();
    await expect(newPage.getByRole('button', { name: /^Informe P\.H\.$/i }).first()).toBeVisible();
    await expect(newPage.getByRole('button', { name: /^Informes$/i })).toHaveCount(0);

    // 7. Validar que la barra de navegación del workspace muestra "Informe P.H."
    await expect(newPage.locator('button', { hasText: 'Informe P.H.' }).first()).toBeVisible();

    await newPage.close();
  });

  test('Bug 4 — abrir Expedición desde expediente PH abre workspace popup (no modal EXPEDITION legacy)', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/licencias');
    await authenticatedPage.waitForLoadState('domcontentloaded');
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.waitForTimeout(1000);

    await authenticatedPage.waitForSelector('button[role="tab"]', { timeout: 30000 });
    const otrasActuacionesTab = authenticatedPage.locator('button[role="tab"]').filter({ hasText: /Otras Actuaciones/i });
    await expect(otrasActuacionesTab).toBeVisible({ timeout: 15000 });
    await otrasActuacionesTab.click();
    await authenticatedPage.waitForTimeout(500);

    const phRow = authenticatedPage.locator('table tbody tr').filter({
      has: authenticatedPage.getByText('68001-1-26-0001', { exact: false }),
    }).first();
    await expect(phRow).toBeVisible({ timeout: 15000 });

    const actionMenuBtn = phRow.locator('button').last();
    await actionMenuBtn.click();

    const expeditionMenuItem = authenticatedPage.getByRole('menuitem', { name: /Expedici[oó]n/i });
    await expect(expeditionMenuItem).toBeVisible();

    const [newPage] = await Promise.all([
      authenticatedPage.waitForEvent('popup'),
      expeditionMenuItem.click(),
    ]);

    await installE2EMocks(newPage);
    await newPage.waitForLoadState('domcontentloaded');
    await newPage.waitForTimeout(1500);

    await expect(newPage).toHaveURL(/\/funmanage\/expediente\/68001-1-26-0001\?section=expedicion/);
    await expect(newPage.getByRole('dialog', { name: /Detalle del expediente/i })).toBeVisible();
    await expect(newPage.getByRole('button', { name: /^Expedici[oó]n P\.H\.$/i })).toBeVisible();
    await expect(newPage.getByRole('button', { name: /^Expedici[oó]n$/i })).toHaveCount(0);
    await expect(authenticatedPage.locator('.ReactModal__Content:visible')).toHaveCount(0);

    await newPage.close();
  });

  test('Bug 1 — escribir en inputs de PH no pierde el foco', async ({ authenticatedPage }) => {
    // 1. Ir directamente al workspace PH de un expediente conocido
    await authenticatedPage.goto('/funmanage/expediente/68001-1-26-0001?section=informes&report=ph');
    await authenticatedPage.waitForLoadState('domcontentloaded');
    await authenticatedPage.waitForTimeout(2000);

    // 2. Localizar el primer input de texto (Área y linderos)
    const areaInput = authenticatedPage.locator('.record_ph_gen input[type="text"]').first();
    await expect(areaInput).toBeVisible();

    // 3. Escribir varios caracteres y verificar que el foco se mantiene en el mismo input
    await areaInput.fill('Prueba de área');
    await expect(areaInput).toBeFocused();

    // 4. Escribir en un input tipo number (Área Total Construida)
    const numberInput = authenticatedPage.locator('.record_ph_gen input[type="number"]').first();
    await expect(numberInput).toBeVisible();

    await numberInput.fill('123.45');
    await expect(numberInput).toBeFocused();

    // 5. Verificar que el valor persiste sin re-render brusco
    await expect(areaInput).toHaveValue('Prueba de área');
    await expect(numberInput).toHaveValue('123.45');
  });

  test('Bug 3 — cerrar workspace PH vuelve a la lista de licencias (no redirige a /dashboard)', async ({ authenticatedPage }) => {
    // 1. Ir a la lista de licencias
    await authenticatedPage.goto('/licencias');
    await authenticatedPage.waitForLoadState('domcontentloaded');
    await authenticatedPage.waitForTimeout(2000);

    // 2. Abrir un workspace PH directamente
    await authenticatedPage.goto('/funmanage/expediente/68001-1-26-0001?section=informes&report=ph');
    await authenticatedPage.waitForLoadState('domcontentloaded');
    await authenticatedPage.waitForTimeout(1500);

    // 3. Click en el botón de "Volver" (flecha hacia atrás) del header
    const backButton = authenticatedPage.getByRole('button', { name: 'Volver' });
    await expect(backButton).toBeVisible();
    await backButton.click();

    // 4. Validar que volvimos a la lista de licencias, NO al dashboard
    await authenticatedPage.waitForURL(/\/licencias/, { timeout: 10000 });
    await expect(authenticatedPage).toHaveURL(/\/licencias/);

    // 5. Verificar que la tabla de licencias sigue visible (no hubo reload brusco)
    await expect(authenticatedPage.getByRole('table').first()).toBeVisible();
  });
});
