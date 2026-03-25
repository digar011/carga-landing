import { test, expect } from '@playwright/test';

test.describe('CarGA Next.js App — Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has correct page title with CarGA', async ({ page }) => {
    await expect(page).toHaveTitle(/CarGA/);
  });

  test('displays hero headline in Spanish', async ({ page }) => {
    const headline = page.locator('h1');
    await expect(headline).toContainText('La bolsa de cargas digital de Argentina');
  });

  test('displays hero description', async ({ page }) => {
    await expect(page.locator('text=Sin llamadas')).toBeVisible();
    await expect(page.locator('text=Sin intermediarios')).toBeVisible();
  });

  test('has transportista CTA button', async ({ page }) => {
    const btn = page.locator('a:has-text("Soy Transportista")');
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAttribute('href', '/registro?role=transportista');
  });

  test('has cargador CTA button', async ({ page }) => {
    const btn = page.locator('a:has-text("Soy Cargador")');
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAttribute('href', '/registro?role=cargador');
  });

  test('has login link', async ({ page }) => {
    const link = page.locator('a:has-text("Iniciar sesión")');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/iniciar-sesion');
  });

  test('has register link', async ({ page }) => {
    const link = page.locator('a:has-text("Registrarse")');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/registro');
  });

  test('displays logo with CarGA branding', async ({ page }) => {
    await expect(page.locator('a:has-text("CarGA")').first()).toBeVisible();
  });

  test('displays market stats section', async ({ page }) => {
    await expect(page.locator('text=460.000+')).toBeVisible();
    await expect(page.locator('text=93%')).toBeVisible();
    await expect(page.locator('text=USD 35.000M')).toBeVisible();
  });

  test('displays stats descriptions in Spanish', async ({ page }) => {
    await expect(page.locator('text=Camiones activos en Argentina')).toBeVisible();
    await expect(page.locator('text=Del transporte de mercaderías es por ruta')).toBeVisible();
    await expect(page.locator('text=Mercado sin digitalizar')).toBeVisible();
  });

  test('displays launch badge', async ({ page }) => {
    await expect(page.locator('text=Buenos Aires, Córdoba, Santa Fe')).toBeVisible();
  });

  test('footer shows Codexium credit', async ({ page }) => {
    await expect(page.locator('text=Codexium')).toBeVisible();
    await expect(page.locator('text=© 2025 CarGA')).toBeVisible();
  });

  test('mobile responsive — hero visible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('a:has-text("Soy Transportista")')).toBeVisible();
  });

  test('meta description contains key terms', async ({ page }) => {
    const meta = page.locator('meta[name="description"]');
    await expect(meta).toHaveAttribute('content', /transportistas/);
    await expect(meta).toHaveAttribute('content', /tiempo real/);
  });

  test('html lang attribute is es-AR', async ({ page }) => {
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'es-AR');
  });

  test('Open Graph meta tags present', async ({ page }) => {
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /CarGA/);
    const ogLocale = page.locator('meta[property="og:locale"]');
    await expect(ogLocale).toHaveAttribute('content', 'es_AR');
  });
});
