import { test, expect } from '@playwright/test';

test.describe('CarGA Next.js App — Auth Pages', () => {
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/iniciar-sesion');
    });

    test('displays login page with heading', async ({ page }) => {
      await expect(page.locator('text=Bienvenido')).toBeVisible();
    });

    test('has email input field', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible();
      await expect(emailInput).toHaveAttribute('placeholder', 'tu@email.com');
    });

    test('has password input field', async ({ page }) => {
      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput).toBeVisible();
    });

    test('has submit button with Spanish text', async ({ page }) => {
      const submitBtn = page.locator('button[type="submit"]');
      await expect(submitBtn).toBeVisible();
      await expect(submitBtn).toContainText('Ingresar');
    });

    test('has register link', async ({ page }) => {
      const registerLink = page.locator('a:has-text("Registrate")');
      await expect(registerLink).toBeVisible();
      await expect(registerLink).toHaveAttribute('href', '/registro');
    });

    test('displays CarGA logo', async ({ page }) => {
      await expect(page.locator('text=🚛').first()).toBeVisible();
    });

    test('displays copyright footer', async ({ page }) => {
      await expect(page.locator('text=© 2025 CarGA')).toBeVisible();
    });

    test('email field has correct autocomplete', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toHaveAttribute('autocomplete', 'email');
    });

    test('password field has correct autocomplete', async ({ page }) => {
      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });
  });

  test.describe('Register Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/registro');
    });

    test('displays role selection step', async ({ page }) => {
      await expect(page.locator('text=Crear cuenta')).toBeVisible();
    });

    test('has transportista role option', async ({ page }) => {
      const btn = page.locator('button:has-text("Soy Transportista")');
      await expect(btn).toBeVisible();
      await expect(page.locator('text=Busco cargas para transportar')).toBeVisible();
    });

    test('has cargador role option', async ({ page }) => {
      const btn = page.locator('button:has-text("Soy Cargador")');
      await expect(btn).toBeVisible();
      await expect(page.locator('text=Necesito enviar mercadería')).toBeVisible();
    });

    test('clicking transportista shows registration form', async ({ page }) => {
      await page.locator('button:has-text("Soy Transportista")').click();
      await expect(page.locator('text=Registro como Transportista')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('clicking cargador shows registration form', async ({ page }) => {
      await page.locator('button:has-text("Soy Cargador")').click();
      await expect(page.locator('text=Registro como Cargador')).toBeVisible();
    });

    test('transportista form shows "Nombre completo" label', async ({ page }) => {
      await page.locator('button:has-text("Soy Transportista")').click();
      await expect(page.locator('label:has-text("Nombre completo")')).toBeVisible();
    });

    test('cargador form shows "Nombre de empresa" label', async ({ page }) => {
      await page.locator('button:has-text("Soy Cargador")').click();
      await expect(page.locator('label:has-text("Nombre de empresa")')).toBeVisible();
    });

    test('back button returns to role selection', async ({ page }) => {
      await page.locator('button:has-text("Soy Transportista")').click();
      await page.locator('button:has-text("Cambiar tipo de cuenta")').click();
      await expect(page.locator('text=Crear cuenta')).toBeVisible();
    });

    test('has login link', async ({ page }) => {
      const loginLink = page.locator('a:has-text("Iniciá sesión")');
      await expect(loginLink).toBeVisible();
      await expect(loginLink).toHaveAttribute('href', '/iniciar-sesion');
    });

    test('pre-selects role from URL param', async ({ page }) => {
      await page.goto('/registro?role=cargador');
      await expect(page.locator('text=Registro como Cargador')).toBeVisible();
    });

    test('pre-selects transportista from URL param', async ({ page }) => {
      await page.goto('/registro?role=transportista');
      await expect(page.locator('text=Registro como Transportista')).toBeVisible();
    });

    test('submit button shows "Crear cuenta"', async ({ page }) => {
      await page.locator('button:has-text("Soy Transportista")').click();
      const submitBtn = page.locator('button[type="submit"]');
      await expect(submitBtn).toContainText('Crear cuenta');
    });

    test('password field requires minimum 8 characters', async ({ page }) => {
      await page.locator('button:has-text("Soy Transportista")').click();
      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput).toHaveAttribute('minlength', '8');
    });
  });
});
