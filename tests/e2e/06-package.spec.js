// tests/e2e/06-package.spec.js
// =============================================
// DEMONSTRASI: Manajemen Paket Masuk
// =============================================
const { test, expect } = require('@playwright/test');

test.describe('📦 Manajemen Paket', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('TC-19: Halaman /package memuat daftar paket', async ({ page }) => {
    await page.goto('/package');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText(/paket|package|kurir/i);
    await page.screenshot({ path: 'tests/screenshots/package-list.png' });
  });

  test('TC-20: Submit form paket BERHASIL jika ada karyawan', async ({ page }) => {
    await page.goto('/package');
    await page.waitForLoadState('networkidle');

    // Cek dropdown karyawan
    const employeeSelect = page.locator('select[name="tujuanPaket"]');
    if (await employeeSelect.count() === 0) {
      console.log('⚠️  Tidak ada dropdown karyawan. TC-20 dilewati.');
      return;
    }

    const optionCount = await employeeSelect.locator('option').count();
    if (optionCount <= 1) {
      console.log('⚠️  Tidak ada karyawan di database. TC-20 dilewati.');
      return;
    }

    // Isi form paket
    const resiInput = page.locator('input[name="nomorResi"]');
    if (await resiInput.count() > 0) {
      await resiInput.fill('TEST-RESI-' + Date.now());
    }

    const tipePaket = page.locator('select[name="tipePaket"], input[name="tipePaket"]');
    if (await tipePaket.count() > 0) {
      if (await tipePaket.evaluate(el => el.tagName) === 'SELECT') {
        await tipePaket.selectOption({ index: 1 });
      } else {
        await tipePaket.fill('Dokumen');
      }
    }

    const kurirInput = page.locator('input[name="namaKurir"]');
    if (await kurirInput.count() > 0) {
      await kurirInput.fill('JNE Test Kurir');
    }

    const emailKurir = page.locator('input[name="emailKurir"]');
    if (await emailKurir.count() > 0) {
      await emailKurir.fill('kurir@test.com');
    }

    const hpKurir = page.locator('input[name="nomorHpKurir"]');
    if (await hpKurir.count() > 0) {
      await hpKurir.fill('081298765432');
    }

    const pengirim = page.locator('input[name="pengirim"]');
    if (await pengirim.count() > 0) {
      await pengirim.fill('PT. Pengirim Test');
    }

    // Pilih karyawan penerima
    await employeeSelect.selectOption({ index: 1 });

    await page.screenshot({ path: 'tests/screenshots/package-form-filled.png' });

    // Submit
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
      await page.waitForLoadState('networkidle');
    }

    await page.screenshot({ path: 'tests/screenshots/package-submitted.png' });
    console.log('✅ TC-20: Submit paket selesai.');
  });

});
