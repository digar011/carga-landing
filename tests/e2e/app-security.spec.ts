import { test, expect } from '@playwright/test';

test.describe('CarGA Security Headers & Best Practices', () => {
  test('home page returns security headers', async ({ request }) => {
    const response = await request.get('/');
    const headers = response.headers();

    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['strict-transport-security']).toContain('max-age=31536000');
    expect(headers['content-security-policy']).toBeTruthy();
  });

  test('CSP includes required directives', async ({ request }) => {
    const response = await request.get('/');
    const csp = response.headers()['content-security-policy'] ?? '';

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain('maps.googleapis.com');
    expect(csp).toContain('fonts.googleapis.com');
    expect(csp).toContain('supabase.co');
  });

  test('no sensitive data in HTML source', async ({ page }) => {
    await page.goto('/');
    const html = await page.content();

    // Should not contain API keys or secrets
    expect(html).not.toContain('supabase_service_role');
    expect(html).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
    expect(html).not.toContain('sk-ant-');
    expect(html).not.toContain('WHATSAPP_ACCESS_TOKEN');
    expect(html).not.toContain('MERCADOPAGO_ACCESS_TOKEN');
    expect(html).not.toContain('RESEND_API_KEY');
  });

  test('login page does not expose secrets', async ({ page }) => {
    await page.goto('/iniciar-sesion');
    const html = await page.content();

    expect(html).not.toContain('service_role');
    expect(html).not.toContain('FIREBASE_SERVER_KEY');
  });

  test('register page does not expose secrets', async ({ page }) => {
    await page.goto('/registro');
    const html = await page.content();

    expect(html).not.toContain('service_role');
    expect(html).not.toContain('SENTRY_AUTH_TOKEN');
  });

  test('static files do not expose env vars', async ({ page }) => {
    await page.goto('/landing/index.html');
    const html = await page.content();

    expect(html).not.toContain('process.env');
    expect(html).not.toContain('SUPABASE');
  });

  test('non-existent routes return 404', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist');
    expect(response?.status()).toBe(404);
  });

  test('API auth callback exists', async ({ request }) => {
    // Should redirect (302) since no code is provided
    const response = await request.get('/api/auth/callback', {
      maxRedirects: 0,
    });
    // Without a code param, it should redirect to login with error
    expect([302, 307, 308]).toContain(response.status());
  });

  test('forms have proper autocomplete attributes', async ({ page }) => {
    await page.goto('/iniciar-sesion');
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('autocomplete', 'email');

    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
  });

  test('register form uses new-password autocomplete', async ({ page }) => {
    await page.goto('/registro?role=transportista');
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');
  });

  test('all pages set lang attribute to es-AR', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es-AR');

    await page.goto('/iniciar-sesion');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es-AR');

    await page.goto('/registro');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es-AR');
  });
});
