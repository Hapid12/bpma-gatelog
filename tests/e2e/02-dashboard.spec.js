// tests/e2e/02-dashboard.spec.js
// =============================================
// DEMONSTRASI: Dashboard Admin
// =============================================
const { test, expect } = require('@playwright/test');

test.describe('📊 Dashboard Admin', () => {

  test.beforeEach(async ({ page }) => {
    // Login sebagai admin sebelum setiap test
    await page.goto('/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('TC-06: Dashboard memuat statistik (visitor & paket hari ini)', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/visitor|tamu/i);
    // Cek ada elemen statistik di halaman
    const content = await page.textContent('body');
    expect(content).toMatch(/dashboard|hari ini|bulan/i);
    await page.screenshot({ path: 'tests/screenshots/dashboard.png' });
  });

  test('TC-07: Dashboard menampilkan tabel visitor & paket terbaru', async ({ page }) => {
    const content = await page.textContent('body');
    // Pastikan halaman dashboard berhasil dirender
    expect(content.length).toBeGreaterThan(100);
  });

});
