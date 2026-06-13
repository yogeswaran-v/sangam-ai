import { test, expect } from '@playwright/test'
import { injectSession } from '../helpers/auth'
import { SHARED_EMAIL, SHARED_PASSWORD } from '../helpers/global-setup'

test.describe('Usage dashboard', () => {
  test('renders usage page', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/usage')
    await expect(page.getByText(/usage/i).first()).toBeVisible({ timeout: 8000 })
  })

  test('shows token stat cards', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/usage')
    // Multiple elements mention "Tokens" — .first() avoids strict-mode violations
    await expect(page.getByText(/tokens/i).first()).toBeVisible({ timeout: 8000 })
    // Stat card labels: "Input Tokens this month" / "Output Tokens this month"
    await expect(page.getByText('Input Tokens this month')).toBeVisible()
    await expect(page.getByText('Output Tokens this month')).toBeVisible()
  })

  test('shows per-agent breakdown', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/usage')

    await expect(page.getByText('Usage by Agent')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('CEO Agent', { exact: true })).toBeVisible()
    await expect(page.getByText('Product Agent', { exact: true })).toBeVisible()
    await expect(page.getByText('Engineering Agent', { exact: true })).toBeVisible()
  })

  // The usage UI does not render a model name anywhere — it shows cost
  // figures instead (Total Cost stat + Cost column in the agent table).
  test('shows cost information in usage data', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/usage')
    await expect(page.getByText('Total Cost this month', { exact: true })).toBeVisible({ timeout: 8000 })
    // Starter plan shows the demo spend-cap bar ("Cost this month")
    await expect(page.getByText('Cost this month', { exact: true })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Cost', exact: true })).toBeVisible()
  })
})
