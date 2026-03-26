import { test, expect } from '@playwright/test';

test.describe('CarGA — Páginas de Administración', () => {
  test('panel de administración carga con título correcto', async ({ page }) => {
    await page.goto('/a-panel');
    const heading = page.locator('h1');
    await expect(heading).toContainText('Panel de Administración');
  });

  test('página de usuarios carga con título correcto', async ({ page }) => {
    await page.goto('/a-usuarios');
    const heading = page.locator('h1');
    await expect(heading).toContainText('Gestión de Usuarios');
  });

  test('página de cargas carga con título correcto', async ({ page }) => {
    await page.goto('/a-cargas');
    const heading = page.locator('h1');
    await expect(heading).toContainText('Gestión de Cargas');
  });

  test('página de reportes carga con título correcto', async ({ page }) => {
    await page.goto('/a-reportes');
    const heading = page.locator('h1');
    await expect(heading).toContainText('Reportes');
  });

  test('panel tiene navegación lateral (sidebar)', async ({ page }) => {
    await page.goto('/a-panel');
    // Admin layout includes Sidebar component with role="admin"
    const sidebar = page.locator('nav, aside').first();
    await expect(sidebar).toBeVisible();
  });

  test('página de usuarios tiene navegación lateral', async ({ page }) => {
    await page.goto('/a-usuarios');
    const sidebar = page.locator('nav, aside').first();
    await expect(sidebar).toBeVisible();
  });

  test('página de cargas tiene navegación lateral', async ({ page }) => {
    await page.goto('/a-cargas');
    const sidebar = page.locator('nav, aside').first();
    await expect(sidebar).toBeVisible();
  });

  test('página de reportes tiene navegación lateral', async ({ page }) => {
    await page.goto('/a-reportes');
    const sidebar = page.locator('nav, aside').first();
    await expect(sidebar).toBeVisible();
  });

  test('panel muestra metadata de título con CarGA', async ({ page }) => {
    await page.goto('/a-panel');
    await expect(page).toHaveTitle(/CarGA/);
  });
});
