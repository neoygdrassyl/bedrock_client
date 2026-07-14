import { test, expect } from '../fixtures/auth.fixture';

test.use({ viewport: { width: 1920, height: 1080 } });

async function expectOverlayToCoverViewport(page) {
  const overlay = page.locator('.ReactModal__Overlay').last();
  await expect(overlay).toBeVisible();

  const overlayBox = await overlay.boundingBox();
  const viewport = page.viewportSize();

  expect(overlayBox).not.toBeNull();
  expect(viewport).not.toBeNull();

  expect(Math.abs(overlayBox.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(overlayBox.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(overlayBox.width - viewport.width)).toBeLessThanOrEqual(2);
  expect(Math.abs(overlayBox.height - viewport.height)).toBeLessThanOrEqual(2);
}

test('B-07 smoke: el modal base de Ventanilla cubre todo el viewport', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/ventanilla');
  await authenticatedPage.waitForLoadState('domcontentloaded');

  await authenticatedPage.getByRole('button', { name: /Nueva Entrada/i }).click();

  await expect(authenticatedPage.locator('.ReactModal__Content').last()).toContainText('Nueva Entrada');
  await expectOverlayToCoverViewport(authenticatedPage);
});

test('B-05 smoke: el modal de nueva entrada en Ventanilla queda centrado y con ancho operativo', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/ventanilla');
  await authenticatedPage.waitForLoadState('domcontentloaded');

  await authenticatedPage.getByRole('button', { name: /Nueva Entrada/i }).click();

  const modal = authenticatedPage.locator('.ReactModal__Content').last();
  await expect(modal).toBeVisible();
  await expect(modal).toContainText('Nueva Entrada');
  await expect(modal).toContainText('Número de radicación');

  const modalBox = await modal.boundingBox();
  const viewport = authenticatedPage.viewportSize();

  expect(modalBox).not.toBeNull();
  expect(viewport).not.toBeNull();

  // submitModalStyles (submit.js) sets `width: min(96vw, 1840px)`, centered via
  // `left: 50%` + `translateX(-50%)` — a deliberately near-full-width modal, not
  // the ~70%-wide LegacyModal default this test used to assume.
  const expectedWidth = Math.min(viewport.width * 0.96, 1840);
  const expectedInset = (viewport.width - expectedWidth) / 2;

  expect(Math.abs(modalBox.width - expectedWidth)).toBeLessThanOrEqual(4);
  expect(Math.abs(modalBox.x - expectedInset)).toBeLessThanOrEqual(4);
});

test('B-05 smoke: el modal de actualización en Ventanilla muestra la jerarquía documental nueva', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/ventanilla');
  await authenticatedPage.waitForLoadState('domcontentloaded');

  await authenticatedPage.locator('button[title="Abrir"]').first().click();

  const modal = authenticatedPage.locator('.ReactModal__Content').last();
  await expect(modal).toBeVisible();
  await expect(modal).toContainText('Actualizar Entrada');
  // "Jerarquía documental nueva": panel del documento de ingreso (antes "Documento
  // principal") + inventario de digitales (antes "Listas documentales" / "Inventario
  // de listas") — ver submit_anex.component.js renderPrimaryDocumentControls /
  // renderDigitalDocuments.
  await expect(modal).toContainText('Documento de ingreso');
  await expect(modal).toContainText('Digitales');
  await expect(modal).toContainText('ANEXAR DOCUMENTO');
});

test('B-07 smoke: el macromodal de Gestión Licencias cubre todo el viewport', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/licencias/gestion');
  await authenticatedPage.waitForLoadState('domcontentloaded');

  const macroForm = authenticatedPage.locator('#load_macro_date_1').locator('xpath=ancestor::form');

  await expect(macroForm).toBeVisible();
  await macroForm.getByRole('button', { name: /^cargar$/i }).click();

  await expect(authenticatedPage.locator('.ReactModal__Content').last()).toContainText('Macro tabla de seguimiento');
  await expectOverlayToCoverViewport(authenticatedPage);
});