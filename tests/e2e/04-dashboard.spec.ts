import { test, expect } from '@playwright/test'
import { injectSession } from '../helpers/auth'
import { SHARED_EMAIL, SHARED_PASSWORD } from '../helpers/global-setup'

test.describe('Dashboard', () => {
  test('renders Mission Control page with stats', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard')

    // TopBar heading (sidebar also has a "Mission Control" link — scope to the heading)
    await expect(page.getByRole('heading', { name: 'Mission Control' })).toBeVisible()
    // Stats cards (labels from LiveStats)
    await expect(page.getByText('Tasks Active')).toBeVisible()
    await expect(page.getByText('Pending Approvals')).toBeVisible()
    await expect(page.getByText('Messages Today')).toBeVisible()
    await expect(page.getByText('Spend / Month')).toBeVisible()
  })

  test('displays mission data from onboarding', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard')

    await expect(page.getByText(/AI SaaS platform/i).first()).toBeVisible({ timeout: 8000 })
  })

  test('sidebar is visible with all nav links', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard')

    // Exact names — the stat cards are also links (e.g. "Pending Approvals")
    await expect(page.getByRole('link', { name: 'Kanban', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Team Chat', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Pixel World', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Approvals', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Usage & Billing', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Settings', exact: true })).toBeVisible()
  })

  test('stats link to their respective pages', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard')

    // Click "Tasks Active" stat card
    await page.getByText('Tasks Active').click()
    await expect(page).toHaveURL(/\/kanban/)
    await page.goBack()

    // Click "Messages Today" stat card
    await page.getByText('Messages Today').click()
    await expect(page).toHaveURL(/\/chat/)
  })

  test('Edit mission link goes to settings', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard')

    // The Mission Brief card has an "Edit" link to settings
    await page.getByRole('link', { name: 'Edit', exact: true }).click()
    await expect(page).toHaveURL(/\/settings/)
  })

  test('plan badge is displayed', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard')
    // Shared test user is on the starter plan — badge renders "Starter"
    await expect(page.getByText('Starter', { exact: true })).toBeVisible()
  })
})
