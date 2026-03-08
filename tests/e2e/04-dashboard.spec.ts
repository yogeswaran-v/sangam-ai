import { test, expect } from '@playwright/test'
import { injectSession } from '../helpers/auth'
import { SHARED_EMAIL, SHARED_PASSWORD } from '../helpers/global-setup'

test.describe('Dashboard', () => {
  test('renders Mission Control page with stats', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard')

    await expect(page.getByText(/mission control/i)).toBeVisible()
    // Stats cards
    await expect(page.getByText(/tasks active/i)).toBeVisible()
    await expect(page.getByText(/pending approvals/i)).toBeVisible()
    await expect(page.getByText(/messages today/i)).toBeVisible()
    await expect(page.getByText(/tokens this month/i)).toBeVisible()
  })

  test('displays mission data from onboarding', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard')

    await expect(page.getByText(/AI SaaS platform/i)).toBeVisible({ timeout: 8000 })
  })

  test('sidebar is visible with all nav links', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard')

    await expect(page.getByRole('link', { name: /kanban/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /chat/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /pixel world/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /approvals/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /usage/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /settings/i })).toBeVisible()
  })

  test('stats link to their respective pages', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard')

    // Click "Tasks Active" stat card
    await page.getByText(/tasks active/i).click()
    await expect(page).toHaveURL(/\/kanban/)
    await page.goBack()

    // Click "Messages Today" stat card
    await page.getByText(/messages today/i).click()
    await expect(page).toHaveURL(/\/chat/)
  })

  test('Edit mission link goes to settings', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard')

    await page.getByRole('link', { name: /edit mission/i }).click()
    await expect(page).toHaveURL(/\/settings/)
  })

  test('plan badge is displayed', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard')
    await expect(page.getByText(/starter|pro|scale/i)).toBeVisible()
  })
})
