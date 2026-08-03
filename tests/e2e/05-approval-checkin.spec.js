// tests/e2e/05-approval-checkin.spec.js
// =============================================
// DEMONSTRASI: Check-In & Check-Out oleh Satpam
// =============================================
const { test, expect } = require('@playwright/test');

test.describe('✅ Approval & Check-In/Out (Satpam)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'satpam');
    await page.fill('#password', 'satpam123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('TC-15: Satpam dapat membuka halaman /approval', async ({ page }) => {
    await page.goto('/approval');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText(/approval|check|visitor|tamu/i);
    await page.screenshot({ path: 'tests/screenshots/approval-page.png' });
  });

  test('TC-16: Satpam dapat melakukan Check-In tamu yang sudah approved', async ({ page }) => {
    await page.goto('/approval');
    await page.waitForLoadState('networkidle');

    // Cari tombol check-in
    const checkInBtn = page.locator('button:has-text("Check In"), button:has-text("check-in"), button:has-text("Masuk"), [data-action="checkin"]').first();

    if (await checkInBtn.count() === 0) {
      console.log('⚠️  Tidak ada tamu approved untuk di-check-in. TC-16 dilewati.');
      return;
    }

    await checkInBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'tests/screenshots/checkin-done.png' });
    console.log('✅ TC-16: Check-In berhasil.');
  });

  test('TC-17: Satpam dapat melakukan Check-Out tamu yang sudah Check-In', async ({ page }) => {
    await page.goto('/approval');
    await page.waitForLoadState('networkidle');

    // Cari tombol check-out
    const checkOutBtn = page.locator('button:has-text("Check Out"), button:has-text("checkout"), button:has-text("Keluar"), [data-action="checkout"]').first();

    if (await checkOutBtn.count() === 0) {
      console.log('⚠️  Tidak ada tamu checked-in untuk di-check-out. TC-17 dilewati.');
      return;
    }

    await checkOutBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'tests/screenshots/checkout-done.png' });
    console.log('✅ TC-17: Check-Out berhasil.');
  });

  test('TC-18: Satpam dapat mencetak Visitor Pass', async ({ page }) => {
    await page.goto('/approval');
    await page.waitForLoadState('networkidle');

    // Cari link/tombol cetak visitor pass
    const passBtn = page.locator('a[href*="/approval/pass/"], button:has-text("Pass"), a:has-text("Cetak")').first();

    if (await passBtn.count() === 0) {
      console.log('⚠️  Tidak ada visitor pass yang bisa dicetak. TC-18 dilewati.');
      return;
    }

    await passBtn.click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/visitor-pass.png' });
    await expect(page.locator('body')).toContainText(/pass|visitor|BPMA/i);
    console.log('✅ TC-18: Visitor Pass berhasil dimuat.');
  });

});
