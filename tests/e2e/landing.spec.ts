import { test, expect } from '@playwright/test';

test.describe('CarGA Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test('has correct page title and meta description', async ({ page }) => {
    await expect(page).toHaveTitle(/CarGA/);
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /transportistas/);
  });

  test('displays hero section with headline', async ({ page }) => {
    const headline = page.locator('h1');
    await expect(headline).toContainText('La bolsa de cargas digital de Argentina');
  });

  test('displays hero subheadline', async ({ page }) => {
    const sub = page.locator('.hero-sub');
    await expect(sub).toContainText('Sin llamadas');
    await expect(sub).toContainText('Sin intermediarios');
  });

  test('hero CTA button scrolls to signup section', async ({ page }) => {
    const cta = page.locator('#hero-cta');
    await expect(cta).toBeVisible();
    await cta.click();
    await page.waitForTimeout(800);
    const signupSection = page.locator('#unirse');
    await expect(signupSection).toBeInViewport();
  });

  test('displays three problem cards', async ({ page }) => {
    const cards = page.locator('.problem-card');
    await expect(cards).toHaveCount(3);
  });

  test('displays three how-it-works steps', async ({ page }) => {
    const steps = page.locator('.step');
    await expect(steps).toHaveCount(3);
    await expect(page.locator('.step-number').first()).toContainText('1');
  });

  test('displays three stat cards', async ({ page }) => {
    const stats = page.locator('.stat-card');
    await expect(stats).toHaveCount(3);
    await expect(page.locator('.stat-value').first()).toContainText('460.000+');
  });

  test('signup form is visible with all fields', async ({ page }) => {
    const form = page.locator('#waitlist-form');
    await expect(form).toBeVisible();
    await expect(page.locator('#nombre')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#tipo')).toBeVisible();
    await expect(page.locator('#whatsapp')).toBeVisible();
  });

  test('form shows validation errors for empty required fields', async ({ page }) => {
    await page.locator('.form-submit').click();
    await expect(page.locator('#nombre-error')).toBeVisible();
    await expect(page.locator('#email-error')).toBeVisible();
    await expect(page.locator('#tipo-error')).toBeVisible();
  });

  test('form shows error for invalid email', async ({ page }) => {
    await page.locator('#nombre').fill('Juan Garcia');
    await page.locator('#email').fill('not-an-email');
    await page.locator('#tipo').selectOption('transportista');
    await page.locator('.form-submit').click();
    await expect(page.locator('#email-error')).toBeVisible();
  });

  test('form clears errors on input', async ({ page }) => {
    await page.locator('.form-submit').click();
    await expect(page.locator('#nombre-error')).toBeVisible();
    await page.locator('#nombre').fill('Test');
    await expect(page.locator('#nombre-error')).not.toBeVisible();
  });

  test('successful form submission shows thank you message', async ({ page }) => {
    await page.locator('#nombre').fill('Juan Garcia');
    await page.locator('#email').fill('juan@test.com');
    await page.locator('#tipo').selectOption('transportista');
    await page.locator('.form-submit').click();
    await page.waitForTimeout(600);
    await expect(page.locator('#form-success')).toBeVisible();
    await expect(page.locator('#success-name')).toContainText('Juan');
  });

  test('counter starts at base of 47', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    const count = page.locator('#signup-count');
    await expect(count).toContainText('47');
  });

  test('counter increments after form submission', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.locator('#nombre').fill('Test User');
    await page.locator('#email').fill('test@test.com');
    await page.locator('#tipo').selectOption('cargador');
    await page.locator('.form-submit').click();
    await page.waitForTimeout(600);
    const count = page.locator('#signup-count');
    await expect(count).toContainText('48');
  });

  test('navbar has logo and links', async ({ page }) => {
    await expect(page.locator('.navbar-logo')).toContainText('CarGA');
    await expect(page.locator('.navbar-cta')).toContainText('Unirse');
  });

  test('navbar adds scrolled class on scroll', async ({ page }) => {
    const navbar = page.locator('#navbar');
    await expect(navbar).not.toHaveClass(/scrolled/);
    await page.evaluate(() => window.scrollTo(0, 100));
    await page.waitForTimeout(100);
    await expect(navbar).toHaveClass(/scrolled/);
  });

  test('footer displays correct content', async ({ page }) => {
    const footer = page.locator('.footer');
    await expect(footer).toContainText('CarGA');
    await expect(footer).toContainText('Codexium');
    await expect(footer).toContainText('2025');
  });

  test('benefits list has three items', async ({ page }) => {
    const benefits = page.locator('.benefit-item');
    await expect(benefits).toHaveCount(3);
  });

  test('tipo dropdown has all options', async ({ page }) => {
    const options = page.locator('#tipo option');
    await expect(options).toHaveCount(6);
  });

  test('page is responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator('.navbar-logo')).toBeVisible();
    await expect(page.locator('.navbar-cta')).toBeVisible();
  });
});
