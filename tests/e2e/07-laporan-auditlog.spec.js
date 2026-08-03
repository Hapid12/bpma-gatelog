// tests/e2e/07-laporan-auditlog.spec.js
// =============================================
// DEMONSTRASI: Laporan & Audit Log (Admin Only)
// =============================================
const { test, expect } = require('@playwright/test');

test.describe('📄 Laporan & Audit Log', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('TC-21: Halaman /laporan hanya bisa diakses Admin', async ({ page }) => {
    await page.goto('/laporan');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText(/laporan|visitor|paket/i);
    await page.screenshot({ path: 'tests/screenshots/laporan.png' });
  });

  test('TC-22: Filter laporan berdasarkan bulan berhasil', async ({ page }) => {
    // Filter bulan ini
    const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    await page.goto(`/laporan?month=${thisMonth}`);
    await page.waitForLoadState('networkidle');
    const content = await page.textContent('body');
    expect(content.length).toBeGreaterThan(50);
    await page.screenshot({ path: 'tests/screenshots/laporan-filtered.png' });
  });

  test('TC-23: Halaman cetak laporan bisa diakses Admin', async ({ page }) => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    await page.goto(`/laporan/cetak?month=${thisMonth}`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText(/laporan|visitor|BPMA/i);
    await page.screenshot({ path: 'tests/screenshots/laporan-cetak.png' });
    console.log('✅ TC-23: Halaman cetak laporan berhasil dimuat.');
  });

  test('TC-24: Satpam TIDAK BISA akses /laporan', async ({ page }) => {
    // Logout lalu login sbg satpam
    await page.goto('/logout');
    await page.goto('/login');
    await page.fill('#username', 'satpam');
    await page.fill('#password', 'satpam123');
    await page.click('button[type="submit"]');

    await page.goto('/laporan');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    const body = await page.textContent('body');
    // Satpam seharusnya di-redirect atau lihat pesan ditolak
    const isDenied = !url.includes('/laporan') || body.match(/ditolak|akses|denied/i);
    expect(isDenied).toBeTruthy();
    await page.screenshot({ path: 'tests/screenshots/laporan-satpam-denied.png' });
  });

  test('TC-25: Halaman /audit-log memuat log aktivitas', async ({ page }) => {
    await page.goto('/audit-log');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText(/audit|log|aktivitas|user|action/i);
    await page.screenshot({ path: 'tests/screenshots/audit-log.png' });
    console.log('✅ TC-25: Audit log berhasil dimuat.');
  });

});
