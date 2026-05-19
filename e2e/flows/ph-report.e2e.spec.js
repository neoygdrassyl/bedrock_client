// @ts-check
import { test, expect } from '../fixtures/auth.fixture';

test.describe('E2E: Informe P.H. en detalle de expediente', () => {
  test('renderiza profesionales FUN 5.2 y áreas comunes/privadas PH', async ({ authenticatedPage }) => {
    await authenticatedPage.setViewportSize({ width: 1920, height: 1080 });

    await authenticatedPage.goto('/funmanage/expediente/68001-1-26-0001?section=informes&report=ph');
    await authenticatedPage.waitForLoadState('domcontentloaded');

    await expect(authenticatedPage.getByRole('dialog', { name: /Detalle del expediente/i })).toBeVisible();
    await expect(authenticatedPage.getByText('Informe P.H.')).toBeVisible();

    await expect(authenticatedPage.getByText('PROFESIONAL RESPONSABLE DE LOS PLANOS')).toBeVisible();
    await expect(authenticatedPage.getByText('ARQUITECTO PROYECTISTA')).toBeVisible();
    await expect(authenticatedPage.getByText('IVAN FRANCISCO SOLANO FUENTES')).toBeVisible();
    await expect(authenticatedPage.getByText('Nuevo Profesional')).toHaveCount(0);

    await expect(authenticatedPage.getByText('RELACIÓN DE PLANOS PRESENTADOS')).toBeVisible();
    await expect(authenticatedPage.getByText('OBSERVACIONES A LA INFORMACIÓN PLANIMÉTRICA')).toBeVisible();

    await expect(authenticatedPage.getByText('AREAS COMUNES Y PRIVADAS')).toBeVisible();
    await expect(authenticatedPage.getByText('Apto 101')).toBeVisible();
    await expect(authenticatedPage.getByText('30.25 m2')).toBeVisible();
    await expect(authenticatedPage.getByText(/^AREA TOTAL$/)).toHaveCount(0);
  });
});
