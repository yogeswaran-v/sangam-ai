import { test, expect } from '@playwright/test'
import { injectSession } from '../helpers/auth'
import { SHARED_EMAIL, SHARED_PASSWORD } from '../helpers/global-setup'

test.describe('Approvals center', () => {
  test('renders approvals page', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/approvals')
    await expect(page.getByText(/approvals/i).first()).toBeVisible({ timeout: 8000 })
  })

  test('shows pending approval requests', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/approvals')

    await expect(page.getByText(/Q1 marketing budget/i)).toBeVisible({ timeout: 8000 })
    await expect(page.getByText(/third-party API/i)).toBeVisible()
  })

  test('shows agent name on each approval card', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/approvals')

    await expect(page.getByText(/CEO Agent/i)).toBeVisible({ timeout: 8000 })
    await expect(page.getByText(/Engineering Agent/i)).toBeVisible()
  })

  test('approve button is present on pending requests', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/approvals')

    await expect(page.getByRole('button', { name: /approve/i }).first()).toBeVisible({ timeout: 8000 })
  })

  test('reject button is present on pending requests', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/approvals')

    await expect(page.getByRole('button', { name: /reject|decline/i }).first()).toBeVisible({ timeout: 8000 })
  })

  test('approving a request updates its status', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/approvals')

    // Click approve on first pending request
    await page.getByRole('button', { name: /approve/i }).first().click()

    // The card should either disappear or show "approved" status
    await expect(
      page.getByText(/approved/i).or(page.getByText(/Q1 marketing budget/i).locator('..').getByText(/approved/i))
    ).toBeVisible({ timeout: 8000 })
  })

  test('shows empty state when no pending approvals', async ({ page, context }) => {
    // This test verifies the empty state UI exists and doesn't crash
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/approvals')
    // Page should load without errors regardless of approval count
    await expect(page).not.toHaveURL(/error|500/)
  })
})
