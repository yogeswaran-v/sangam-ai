import { test, expect } from '@playwright/test'
import { injectSession } from '../helpers/auth'
import { SHARED_EMAIL, SHARED_PASSWORD } from '../helpers/global-setup'

test.describe('Pixel world', () => {
  test('renders pixel world canvas area', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/pixel-world')
    // The main world container should be present
    await expect(page.locator('.bg-\\[\\#0d0d18\\]').or(page.getByText(/HQ|Sangam HQ/i))).toBeVisible({ timeout: 8000 })
  })

  test('shows all 6 agent sprites', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/pixel-world')

    await expect(page.getByText(/CEO Agent/i)).toBeVisible({ timeout: 8000 })
    await expect(page.getByText(/Product Agent/i)).toBeVisible()
    await expect(page.getByText(/Engineer/i)).toBeVisible()
    await expect(page.getByText(/Marketing Agent/i)).toBeVisible()
    await expect(page.getByText(/Sales Agent/i)).toBeVisible()
    await expect(page.getByText(/Finance Agent/i)).toBeVisible()
  })

  test('shows department zone labels', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/pixel-world')

    await expect(page.getByText(/Leadership/i)).toBeVisible({ timeout: 8000 })
    await expect(page.getByText(/Engineering/i)).toBeVisible()
    await expect(page.getByText(/Marketing/i)).toBeVisible()
    await expect(page.getByText(/Sales/i)).toBeVisible()
  })

  test('shows HQ meeting table', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/pixel-world')
    await expect(page.getByText('HQ')).toBeVisible({ timeout: 8000 })
  })

  test('shows legend with idle/working/done states', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/pixel-world')

    await expect(page.getByText('Idle')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Working')).toBeVisible()
    await expect(page.getByText('Done')).toBeVisible()
  })

  test('shows activity feed panel', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/pixel-world')
    // Activity feed is the right panel
    await expect(page.getByText(/activity|feed|events/i).first()).toBeVisible({ timeout: 8000 })
  })

  test('shows version label', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/pixel-world')
    await expect(page.getByText(/Sangam HQ/i)).toBeVisible({ timeout: 8000 })
  })
})
