import { test, expect } from '@playwright/test';

test.describe('CarGA — Páginas de Cargas', () => {
  test('tablero de cargas carga en /t-cargas', async ({ page }) => {
    await page.goto('/t-cargas');
    const heading = page.locator('h1');
    await expect(heading).toContainText('Cargas Disponibles');
  });

  test('tablero de cargas tiene título con CarGA', async ({ page }) => {
    await page.goto('/t-cargas');
    await expect(page).toHaveTitle(/CarGA/);
  });

  test('publicar carga carga en /c-publicar con campos de formulario', async ({ page }) => {
    await page.goto('/c-publicar');
    const heading = page.locator('h1');
    await expect(heading).toContainText('Publicar Carga');

    // Check key form fields exist
    await expect(page.locator('#origen_ciudad')).toBeVisible();
    await expect(page.locator('#destino_ciudad')).toBeVisible();
    await expect(page.locator('#tipo_carga')).toBeVisible();
    await expect(page.locator('#peso_tn')).toBeVisible();
    await expect(page.locator('#tarifa_ars')).toBeVisible();
    await expect(page.locator('#fecha_carga')).toBeVisible();
  });

  test('publicar carga tiene botón de envío', async ({ page }) => {
    await page.goto('/c-publicar');
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toContainText('Publicar carga');
  });

  test('mis cargas carga en /c-mis-cargas', async ({ page }) => {
    await page.goto('/c-mis-cargas');
    const heading = page.locator('h1');
    await expect(heading).toContainText('Mis Cargas');
  });

  test('mis cargas tiene título con CarGA', async ({ page }) => {
    await page.goto('/c-mis-cargas');
    await expect(page).toHaveTitle(/CarGA/);
  });

  test('mapa de cargas carga en /t-mapa', async ({ page }) => {
    await page.goto('/t-mapa');
    const heading = page.locator('h1');
    await expect(heading).toContainText('Mapa de Cargas');
  });

  test('mapa de cargas tiene título con CarGA', async ({ page }) => {
    await page.goto('/t-mapa');
    await expect(page).toHaveTitle(/CarGA/);
  });
});
