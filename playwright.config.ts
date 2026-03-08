import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'
config({ path: '.env.test' })
config({ path: '.env.local' })

const isCI = !!process.env.CI
const baseURL = process.env.BASE_URL || 'http://localhost:3000'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: 1,
  outputDir: 'test-results/',
  timeout: 30000,       // 30s per test
  expect: { timeout: 10000 }, // 10s for assertions

  globalSetup: './tests/helpers/global-setup.ts',
  globalTeardown: './tests/helpers/global-setup.ts',

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ...(isCI ? [['github'] as ['github']] : []),
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 60000,
  },
})
