import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'
config({ path: '.env.test' })
config({ path: '.env.local' }) // fallback

const isCI = !!process.env.CI
const baseURL = process.env.BASE_URL || 'http://localhost:3000'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,
  outputDir: 'test-results/',
  reporter: [
    // Always emit list output to terminal
    ['list'],
    // HTML report — viewable locally via `npm run test:report`, published to GitHub Pages in CI
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    // GitHub Actions summary — shows pass/fail inline in the Actions UI
    ...(isCI ? [['github'] as ['github']] : []),
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: isCI
    ? {
        // In CI: use the production build (faster, more stable)
        command: 'npm run start',
        url: baseURL,
        reuseExistingServer: false,
        timeout: 60000,
      }
    : {
        // Locally: reuse running dev server if already up
        command: 'npm run dev',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 30000,
      },
})
