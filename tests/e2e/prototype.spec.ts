import { test, expect } from '@playwright/test';

test.describe('CarGA Prototype', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prototype.html');
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/CarGA/);
  });

  test('shows investor demo banner', async ({ page }) => {
    const banner = page.locator('#demo-banner');
    await expect(banner).toContainText('Modo Demostración');
  });

  test('screen 1 (splash) is visible by default', async ({ page }) => {
    const splash = page.locator('#screen-1');
    await expect(splash).toBeVisible();
    await expect(splash).toContainText('CarGA');
    await expect(splash).toContainText('Soy Transportista');
    await expect(splash).toContainText('Soy Cargador');
  });

  test('splash → login navigation works', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    const login = page.locator('#screen-2');
    await expect(login).toBeVisible();
  });

  test('login screen has pre-filled fields', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    const emailInput = page.locator('.login-input[type="email"]');
    await expect(emailInput).toHaveValue('juan.garcia@gmail.com');
  });

  test('login → home navigation works', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await page.locator('.login-btn').click();
    await page.waitForTimeout(300);
    const home = page.locator('#screen-3');
    await expect(home).toBeVisible();
  });

  test('home screen shows load cards', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await page.locator('.login-btn').click();
    await page.waitForTimeout(300);
    const cards = page.locator('.load-card');
    await expect(cards).toHaveCount(4);
  });

  test('home screen shows filter chips', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await page.locator('.login-btn').click();
    await page.waitForTimeout(300);
    const chips = page.locator('.filter-chip');
    await expect(chips).toHaveCount(4);
    await expect(chips.first()).toHaveClass(/active/);
  });

  test('tapping load card goes to detail screen', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await page.locator('.login-btn').click();
    await page.waitForTimeout(300);
    await page.locator('.load-card').first().click();
    await page.waitForTimeout(300);
    const detail = page.locator('#screen-4');
    await expect(detail).toBeVisible();
  });

  test('detail screen shows route and price', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await page.locator('.login-btn').click();
    await page.waitForTimeout(300);
    await page.locator('.load-card').first().click();
    await page.waitForTimeout(300);
    await expect(page.locator('.detail-price')).toContainText('$285.000 ARS');
    await expect(page.locator('.detail-city').first()).toContainText('BUENOS AIRES');
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

  test('contact button goes to WhatsApp chat', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await page.locator('.login-btn').click();
    await page.waitForTimeout(300);
    await page.locator('.load-card').first().click();
    await page.waitForTimeout(300);
    await page.locator('.detail-btn-primary').click();
    await page.waitForTimeout(300);
    const chat = page.locator('#screen-5');
    await expect(chat).toBeVisible();
  });

  test('WhatsApp chat shows messages', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await page.locator('.login-btn').click();
    await page.waitForTimeout(300);
    await page.locator('.load-card').first().click();
    await page.waitForTimeout(300);
    await page.locator('.detail-btn-primary').click();
    await page.waitForTimeout(300);
    const bubbles = page.locator('.chat-bubble');
    await expect(bubbles).toHaveCount(4);
  });

  test('map screen accessible via bottom nav', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await page.locator('.login-btn').click();
    await page.waitForTimeout(300);
    await page.locator('#screen-3 .nav-item').nth(1).click();
    await page.waitForTimeout(300);
    await expect(page.locator('#screen-6')).toBeVisible();
  });

  test('map pins show bottom sheet on click', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await page.locator('.login-btn').click();
    await page.waitForTimeout(300);
    await page.locator('#screen-3 .nav-item').nth(1).click();
    await page.waitForTimeout(300);
    await page.locator('.map-pin').first().click();
    const sheet = page.locator('#map-sheet');
    await expect(sheet).toBeVisible();
  });

  test('publish screen accessible via bottom nav', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await page.locator('.login-btn').click();
    await page.waitForTimeout(300);
    await page.locator('#screen-3 .nav-item').nth(2).click();
    await page.waitForTimeout(300);
    await expect(page.locator('#screen-7')).toBeVisible();
  });

  test('publish form shows success modal', async ({ page }) => {
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

  test('profile screen accessible via bottom nav', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await page.locator('.login-btn').click();
    await page.waitForTimeout(300);
    await page.locator('#screen-3 .nav-item').nth(4).click();
    await page.waitForTimeout(300);
    await expect(page.locator('#screen-8')).toBeVisible();
  });

  test('profile shows user info and stats', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await page.locator('.login-btn').click();
    await page.waitForTimeout(300);
    await page.locator('#screen-3 .nav-item').nth(4).click();
    await page.waitForTimeout(300);
    await expect(page.locator('.profile-name')).toContainText('Juan García');
    await expect(page.locator('.profile-stat-value').first()).toContainText('47');
  });

  test('messages tab shows coming soon toast', async ({ page }) => {
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await page.locator('.login-btn').click();
    await page.waitForTimeout(300);
    await page.locator('#screen-3 .nav-item').nth(3).click();
    await page.waitForTimeout(100);
    const toast = page.locator('#toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Próximamente');
  });

  test('screen indicator updates on navigation', async ({ page }) => {
    const indicator = page.locator('#screen-indicator');
    await expect(indicator).toContainText('Pantalla 1 de 8');
    await page.locator('.splash-btn-primary').click();
    await page.waitForTimeout(300);
    await expect(indicator).toContainText('Pantalla 2 de 8');
  });

  test('phone frame is visible on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const frame = page.locator('.phone-frame');
    await expect(frame).toBeVisible();
  });
});
