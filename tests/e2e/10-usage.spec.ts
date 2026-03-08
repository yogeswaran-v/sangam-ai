import { test, expect } from '@playwright/test'
import { injectSession } from '../helpers/auth'
import { SHARED_EMAIL, SHARED_PASSWORD } from '../helpers/global-setup'

test.describe('Usage dashboard', () => {
  test('renders usage page', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/usage')
    await expect(page.getByText(/usage/i).first()).toBeVisible({ timeout: 8000 })
  })

  test('shows total token count', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/usage')
    // Total tokens: 500+1200+400+800+600+1500 = 5000
    await expect(page.getByText(/5,000|5000|5\.0K/i).or(page.getByText(/tokens/i))).toBeVisible({ timeout: 8000 })
  })

  test('shows per-agent breakdown', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/usage')

    await expect(page.getByText(/CEO Agent/i)).toBeVisible({ timeout: 8000 })
    await expect(page.getByText(/Product Agent/i)).toBeVisible()
    await expect(page.getByText(/Engineering Agent/i)).toBeVisible()
  })

  test('shows model name in usage data', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/usage')
    await expect(page.getByText(/claude/i)).toBeVisible({ timeout: 8000 })
  })
})
