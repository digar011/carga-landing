import { test, expect } from '@playwright/test';

test.describe('CarGA Interactive Prototype', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/landing/prototype.html');
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/CarGA/);
  });

  test('shows investor demo banner', async ({ page }) => {
    await expect(page.locator('#demo-banner')).toContainText('Modo Demostración');
  });

  test('screen 1 (splash) is visible by default', async ({ page }) => {
    const splash = page.locator('#screen-1');
    await expect(splash).toBeVisible();
    await expect(splash).toContainText('CarGA');
    await expect(splash).toContainText('Soy Transportista');
    await expect(splash).toContainText('Soy Cargador');
  });

  test('splash → login navigation', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#screen-2')).toBeVisible();
  });

  test('login has pre-filled fields', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await expect(page.locator('.login-input[type="email"]')).toHaveValue('juan.garcia@gmail.com');
  });

  test('login → home navigation', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await page.locator('.login-btn').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#screen-3')).toBeVisible();
  });

  test('home shows 4 load cards', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await page.locator('.login-btn').click();
    await page.waitForTimeout(300);
    await expect(page.locator('.load-card')).toHaveCount(4);
  });

  test('home shows filter chips', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await page.locator('.login-btn').click();
    await page.waitForTimeout(300);
    await expect(page.locator('.filter-chip')).toHaveCount(4);
    await expect(page.locator('.filter-chip').first()).toHaveClass(/active/);
  });

  test('load card → detail screen', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await page.locator('.login-btn').click();
    await page.waitForTimeout(300);
    await page.locator('.load-card').first().click();
    await page.waitForTimeout(300);
    await expect(page.locator('#screen-4')).toBeVisible();
    await expect(page.locator('.detail-price')).toContainText('$285.000 ARS');
  });

  test('detail back button returns to home', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await page.locator('.login-btn').click();
    await page.waitForTimeout(300);
    await page.locator('.load-card').first().click();
    await page.waitForTimeout(300);
    await page.locator('.detail-back').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#screen-3')).toBeVisible();
  });

  test('contact button → WhatsApp chat', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await page.locator('.login-btn').click();
    await page.waitForTimeout(300);
    await page.locator('.load-card').first().click();
    await page.waitForTimeout(300);
    await page.locator('.detail-btn-primary').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#screen-5')).toBeVisible();
    await expect(page.locator('.chat-bubble')).toHaveCount(4);
  });

  test('map screen via bottom nav', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await page.locator('.login-btn').click();
    await page.waitForTimeout(300);
    await page.locator('#screen-3 .nav-item').nth(1).click();
    await page.waitForTimeout(300);
    await expect(page.locator('#screen-6')).toBeVisible();
  });

  test('map pin shows bottom sheet', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await page.locator('.login-btn').click();
    await page.waitForTimeout(300);
    await page.locator('#screen-3 .nav-item').nth(1).click();
    await page.waitForTimeout(300);
    await page.locator('.map-pin').first().click();
    await expect(page.locator('#map-sheet')).toBeVisible();
  });

  test('publish screen via bottom nav', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await page.locator('.login-btn').click();
    await page.waitForTimeout(300);
    await page.locator('#screen-3 .nav-item').nth(2).click();
    await page.waitForTimeout(300);
    await expect(page.locator('#screen-7')).toBeVisible();
  });

  test('publish shows success modal', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await page.locator('.login-btn').click();
    await page.waitForTimeout(300);
    await page.locator('#screen-3 .nav-item').nth(2).click();
    await page.waitForTimeout(300);
    await page.locator('.publish-btn').click();
    await expect(page.locator('#publish-modal')).toBeVisible();
    await expect(page.locator('.modal-title')).toContainText('Carga publicada');
  });

  test('profile screen via bottom nav', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await page.locator('.login-btn').click();
    await page.waitForTimeout(300);
    await page.locator('#screen-3 .nav-item').nth(4).click();
    await page.waitForTimeout(300);
    await expect(page.locator('#screen-8')).toBeVisible();
    await expect(page.locator('.profile-name')).toContainText('Juan García');
  });

  test('messages tab shows coming soon toast', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await page.locator('.login-btn').click();
    await page.waitForTimeout(300);
    await page.locator('#screen-3 .nav-item').nth(3).click();
    await page.waitForTimeout(100);
    await expect(page.locator('#toast')).toBeVisible();
    await expect(page.locator('#toast')).toContainText('Próximamente');
  });

  test('screen indicator updates on navigation', async ({ page }) => {
    await expect(page.locator('#screen-indicator')).toContainText('Pantalla 1 de 8');
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#screen-indicator')).toContainText('Pantalla 2 de 8');
  });

  test('phone frame visible on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator('.phone-frame')).toBeVisible();
  });
});
