import { test, expect } from '@playwright/test';

test.describe('CarGA Next.js App — Navigation & Accessibility', () => {
  test('home page links work correctly', async ({ page }) => {
    await page.goto('/');

    // Click "Registrarse" nav link
    await page.locator('a:has-text("Registrarse")').click();
    await expect(page).toHaveURL(/\/registro/);
  });

  test('login page links to register', async ({ page }) => {
    await page.goto('/iniciar-sesion');
    await page.locator('a:has-text("Registrate")').click();
    await expect(page).toHaveURL(/\/registro/);
  });

  test('register page links to login', async ({ page }) => {
    await page.goto('/registro');
    await page.locator('a:has-text("Iniciá sesión")').click();
    await expect(page).toHaveURL(/\/iniciar-sesion/);
  });

  test('register role=transportista skips role selection', async ({ page }) => {
    await page.goto('/registro?role=transportista');
    // Should jump directly to form, not show role selection
    await expect(page.locator('text=Registro como Transportista')).toBeVisible();
    // Role selection buttons should not be visible
    await expect(page.locator('button:has-text("Soy Transportista")')).not.toBeVisible();
  });

  test('home CTA buttons navigate to register with role', async ({ page }) => {
    await page.goto('/');

    const transportistaBtn = page.locator('a:has-text("Soy Transportista")');
    await expect(transportistaBtn).toHaveAttribute('href', '/registro?role=transportista');

    const cargadorBtn = page.locator('a:has-text("Soy Cargador")');
    await expect(cargadorBtn).toHaveAttribute('href', '/registro?role=cargador');
  });

  test('auth layout shows CarGA logo linking to home', async ({ page }) => {
    await page.goto('/iniciar-sesion');
    const logoLink = page.locator('a:has-text("CarGA")').first();
    await expect(logoLink).toHaveAttribute('href', '/');
  });

  test('static landing page is accessible at /landing/', async ({ page }) => {
    const response = await page.goto('/landing/index.html');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText('La bolsa de cargas digital');
  });

  test('static prototype is accessible at /landing/', async ({ page }) => {
    const response = await page.goto('/landing/prototype.html');
    expect(response?.status()).toBe(200);
    await expect(page.locator('#screen-1')).toBeVisible();
  });

  test('all pages have valid viewport meta tag', async ({ page }) => {
    for (const url of ['/', '/iniciar-sesion', '/registro']) {
      await page.goto(url);
      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toHaveAttribute('content', /width=device-width/);
    }
  });

  test('mobile viewport — home page renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();
    // Stats should be stacked on mobile
    await expect(page.locator('text=460.000+')).toBeVisible();
  });

  test('tablet viewport — home page renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('desktop viewport — home page renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    // Login link should be visible on desktop
    await expect(page.locator('a:has-text("Iniciar sesión")')).toBeVisible();
  });
});
