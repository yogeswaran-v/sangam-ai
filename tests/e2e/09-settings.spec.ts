import { test, expect } from '@playwright/test'
import { createTestUser, cleanupTestUser, injectSession, seedOnboardedUser } from '../helpers/auth'

const TEST_EMAIL = 'test-settings@sangam-test.ai'
const TEST_PASSWORD = 'Test1234!'

test.describe('Settings page', () => {
  let userId: string

  test.beforeAll(async () => {
    const user = await createTestUser(TEST_EMAIL, TEST_PASSWORD)
    userId = user!.id
    await seedOnboardedUser(userId)
  })

  test.afterAll(async () => {
    await cleanupTestUser(TEST_EMAIL)
  })

  test('renders settings page with mission fields', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/dashboard/settings')

    await expect(page.getByText(/settings|mission/i).first()).toBeVisible({ timeout: 8000 })
  })

  test('pre-fills mission fields with existing data', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/dashboard/settings')

    // Should show the seeded vision text
    await expect(page.getByText(/AI SaaS platform/i)).toBeVisible({ timeout: 8000 })
  })

  test('vision textarea is editable', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/dashboard/settings')

    const visionField = page.getByLabel(/vision/i).or(page.locator('textarea').first())
    await expect(visionField).toBeVisible({ timeout: 8000 })
    await expect(visionField).toBeEditable()
  })

  test('save button is present', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/dashboard/settings')

    await expect(page.getByRole('button', { name: /save/i })).toBeVisible({ timeout: 8000 })
  })

  test('can update and save mission data', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/dashboard/settings')

    const textarea = page.locator('textarea').first()
    await expect(textarea).toBeVisible({ timeout: 8000 })
    await textarea.fill('Updated vision: AI-first platform for global founders')

    await page.getByRole('button', { name: /save/i }).click()

    // Should show success feedback
    await expect(
      page.getByText(/saved|updated|success/i).or(page.getByRole('status'))
    ).toBeVisible({ timeout: 8000 })
  })

  test('settings page shows plan information', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/dashboard/settings')

    await expect(page.getByText(/starter|pro|scale|plan/i)).toBeVisible({ timeout: 8000 })
  })
})
