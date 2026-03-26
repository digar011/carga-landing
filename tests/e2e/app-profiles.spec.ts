import { test, expect } from '@playwright/test';

test.describe('CarGA — Páginas de Perfil', () => {
  test('perfil de transportista carga en /t-perfil', async ({ page }) => {
    await page.goto('/t-perfil');
    const heading = page.locator('h1');
    await expect(heading).toContainText('Mi Perfil');
  });

  test('perfil de cargador carga en /c-perfil', async ({ page }) => {
    await page.goto('/c-perfil');
    const heading = page.locator('h1');
    await expect(heading).toContainText('Mi Perfil');
  });

  test('perfil de transportista tiene título con CarGA', async ({ page }) => {
    await page.goto('/t-perfil');
    await expect(page).toHaveTitle(/CarGA/);
  });

  test('perfil de cargador tiene título con CarGA', async ({ page }) => {
    await page.goto('/c-perfil');
    await expect(page).toHaveTitle(/CarGA/);
  });

  test('planes de transportista carga en /t-perfil/planes', async ({ page }) => {
    await page.goto('/t-perfil/planes');
    const heading = page.locator('h1');
    await expect(heading).toContainText('Planes y Precios');
  });

  test('planes de cargador carga en /c-perfil/planes', async ({ page }) => {
    await page.goto('/c-perfil/planes');
    const heading = page.locator('h1');
    await expect(heading).toContainText('Planes y Precios');
  });

  test('planes de transportista muestra tarjetas de planes', async ({ page }) => {
    await page.goto('/t-perfil/planes');
    // Plans page renders PlanCard components in a grid
    const planCards = page.locator('[class*="grid"] > div');
    await expect(planCards.first()).toBeVisible();
  });

  test('planes de cargador muestra tarjetas de planes', async ({ page }) => {
    await page.goto('/c-perfil/planes');
    const planCards = page.locator('[class*="grid"] > div');
    await expect(planCards.first()).toBeVisible();
  });
});
