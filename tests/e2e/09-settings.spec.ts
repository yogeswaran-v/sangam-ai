import { test, expect } from '@playwright/test'
import { injectSession } from '../helpers/auth'
import { SHARED_EMAIL, SHARED_PASSWORD } from '../helpers/global-setup'

test.describe('Settings page', () => {
  test('renders settings page with mission fields', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/settings')

    await expect(page.getByText(/settings|mission/i).first()).toBeVisible({ timeout: 8000 })
  })

  test('pre-fills mission fields with existing data', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/settings')

    // The seeded vision is rendered as the value of the first Mission Control textarea
    const visionField = page.locator('textarea').first()
    await expect(visionField).toBeVisible({ timeout: 8000 })
    await expect(visionField).toHaveValue(/AI SaaS platform/i)
  })

  test('vision textarea is editable', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/settings')

    const visionField = page.locator('textarea').first()
    await expect(visionField).toBeVisible({ timeout: 8000 })
    await expect(visionField).toBeEditable()
  })

  test('save button is present', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/settings')

    // exact: true — the page also has "Save notification settings" and "Update mission"
    await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible({ timeout: 8000 })
  })

  test('can update and save mission data', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/settings')

    const textarea = page.locator('textarea').first()
    await expect(textarea).toBeVisible({ timeout: 8000 })
    await textarea.fill('Updated vision: AI-first platform for global founders')

    // Mission fields are saved via the "Update mission" button
    await page.getByRole('button', { name: 'Update mission', exact: true }).click()

    // Success message: "Mission updated. Agents will adapt on next cycle."
    await expect(page.getByText(/mission updated/i)).toBeVisible({ timeout: 8000 })
  })

  // Plan information is no longer shown on the settings page —
  // it now lives on the Usage & Billing page ("Current Plan" card).
  test('plan information is shown on usage & billing page', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/usage')

    await expect(page.getByText('Current Plan')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Starter', { exact: true })).toBeVisible()
  })
})
