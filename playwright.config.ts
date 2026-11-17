import { defineConfig, devices } from '@playwright/test'
import { join, resolve } from 'node:path'

const artifacts = process.env.KALAVEDIKE_ARTIFACTS_DIR ?? resolve('test-results')

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: 2,
  forbidOnly: true,
  retries: 0,
  outputDir: join(artifacts, 'playwright-results'),
  reporter: [
    ['list'],
    ['html', { outputFolder: join(artifacts, 'playwright-report'), open: 'never' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:4178',
    timezoneId: 'Asia/Kolkata',
    locale: 'en-IN',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', grepInvert: /production subpath/, use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', grepInvert: /production subpath/, use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, defaultBrowserType: 'chromium' } },
    {
      name: 'production-desktop',
      grep: /production subpath/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 }, baseURL: 'http://127.0.0.1:4179/Kalavedike/' },
    },
    {
      name: 'production-mobile',
      grep: /production subpath/,
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, defaultBrowserType: 'chromium', baseURL: 'http://127.0.0.1:4179/Kalavedike/' },
    },
  ],
  webServer: [
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 4178 --strictPort',
      url: 'http://127.0.0.1:4178',
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: 'npm run build && npm run preview -- --base /Kalavedike/ --host 127.0.0.1 --port 4179 --strictPort',
      url: 'http://127.0.0.1:4179/Kalavedike/',
      reuseExistingServer: false,
      timeout: 90_000,
    },
  ],
})
