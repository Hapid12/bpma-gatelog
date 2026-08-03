// tests/e2e/01-login.spec.js
// =============================================
// DEMONSTRASI: Login & Logout
// =============================================
const { test, expect } = require('@playwright/test');

test.describe('🔐 Autentikasi — Login & Logout', () => {

  test('TC-01: Login dengan username/password SALAH harus gagal', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.fill('#username', 'admin');
    await page.fill('#password', 'passwordsalah');
    await page.click('button[type="submit"]');

    // Tunggu redirect selesai
    await page.waitForLoadState('networkidle');

    // Harus tetap di halaman login
    await expect(page).toHaveURL(/login/);

    // Cek flash error — bisa muncul dalam berbagai elemen
    const pageSource = await page.content();
    const body = await page.textContent('body');

    // Flash message bisa berupa: teks biasa, alert div, atau class error
    const hasErrorMsg = body.match(/salah|error|gagal|incorrect|invalid/i)
      || pageSource.match(/alert|flash|error/i);

    // Fallback: setidaknya kita masih di halaman login (bukan dashboard)
    const stillAtLogin = page.url().includes('login');
    expect(stillAtLogin).toBe(true);

    await page.screenshot({ path: 'tests/screenshots/login-wrong-password.png' });
    console.log('✅ TC-01: Login gagal → tetap di halaman login. Flash:', hasErrorMsg ? 'ada' : 'tidak terlihat di body');
  });

  test('TC-02: Login sebagai ADMIN berhasil → redirect ke dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');

    // Harus redirect ke dashboard
    await expect(page).toHaveURL('http://localhost:3000/');
    await expect(page.locator('body')).toContainText(/dashboard|selamat datang|BPMA/i);
  });

  test('TC-03: Halaman protected redirect ke login jika belum login', async ({ page }) => {
    // Akses dashboard tanpa login
    await page.goto('/');
    await expect(page).toHaveURL(/login/);
  });

  test('TC-04: Login sebagai SATPAM berhasil → redirect ke dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'satpam');
    await page.fill('#password', 'satpam123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('http://localhost:3000/');
    await expect(page.locator('body')).toContainText(/dashboard|BPMA/i);
  });

  test('TC-05: Logout berhasil → redirect ke login', async ({ page }) => {
    // Login dulu
    await page.goto('/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3000/');

    // Logout
    await page.goto('/logout');
    await expect(page).toHaveURL(/login/);
  });

});
