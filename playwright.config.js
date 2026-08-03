// playwright.config.js
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'tests/playwright-report', open: 'never' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    headless: false,        // Tampilkan browser agar kelihatan seperti demo
    slowMo: 600,            // Perlambat aksi agar mudah dilihat
    screenshot: 'on',       // Ambil screenshot setiap test
    video: 'on',            // Rekam video demonstrasi
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  // Jangan start server otomatis — server dijalankan manual
  webServer: undefined,
});
