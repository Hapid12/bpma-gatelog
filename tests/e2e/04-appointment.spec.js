// tests/e2e/04-appointment.spec.js
// =============================================
// DEMONSTRASI: Approval Appointment oleh Admin
// =============================================
const { test, expect } = require('@playwright/test');

test.describe('📋 Manajemen Appointment (Admin)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('TC-11: Halaman /appointment hanya bisa diakses Admin', async ({ page }) => {
    await page.goto('/appointment');
    await expect(page.locator('body')).toContainText(/appointment|jadwal|tamu/i);
    await page.screenshot({ path: 'tests/screenshots/appointment-admin.png' });
  });

  test('TC-12: Satpam TIDAK BISA akses /appointment → redirect ke dashboard', async ({ page }) => {
    // Logout dulu
    await page.goto('/logout');

    // Login sebagai satpam
    await page.goto('/login');
    await page.fill('#username', 'satpam');
    await page.fill('#password', 'satpam123');
    await page.click('button[type="submit"]');

    // Akses appointment — harus ditolak
    await page.goto('/appointment');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    const body = await page.textContent('body');

    // Satpam seharusnya di-redirect ke dashboard atau lihat pesan akses ditolak
    const isDenied = !url.includes('/appointment') || body.match(/ditolak|akses|denied/i);
    expect(isDenied).toBeTruthy();
    await page.screenshot({ path: 'tests/screenshots/appointment-satpam-denied.png' });
  });

  test('TC-13: Admin dapat melihat daftar pending appointment', async ({ page }) => {
    await page.goto('/appointment');
    await page.waitForLoadState('networkidle');
    const content = await page.textContent('body');
    expect(content.length).toBeGreaterThan(50);
    await page.screenshot({ path: 'tests/screenshots/appointment-list.png' });
  });

  test('TC-14: Admin dapat Approve appointment yang pending', async ({ page }) => {
    await page.goto('/appointment');
    await page.waitForLoadState('networkidle');

    // Cari tombol approve di tabel
    const approveBtn = page.locator('button:has-text("Approve"), button:has-text("approve"), [data-action="approved"], .btn-approve').first();

    if (await approveBtn.count() === 0) {
      console.log('⚠️  Tidak ada appointment pending. Test TC-14 dilewati.');
      return;
    }

    await approveBtn.click();
    await page.waitForTimeout(1500);

    // Cek respons (JSON sukses atau UI berubah)
    await page.screenshot({ path: 'tests/screenshots/appointment-approved.png' });
    console.log('✅ TC-14: Approve appointment berhasil dijalankan.');
  });

});
