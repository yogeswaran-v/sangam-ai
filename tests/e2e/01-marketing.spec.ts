import { test, expect } from '@playwright/test'

/**
 * Marketing site — public pages accessible without auth
 */
test.describe('Marketing site', () => {
  test('home page loads with correct branding', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Sangam/i)
    await expect(page.getByText('Sangam', { exact: false }).first()).toBeVisible()
  })

  test('home page has a call-to-action button linking to login', async ({ page }) => {
    await page.goto('/')
    // CTA should link to login or sign up
    const ctaLink = page.getByRole('link', { name: /get started|sign up|start|try|launch/i }).first()
    await expect(ctaLink).toBeVisible()
  })

  test('home page has a login link in navbar', async ({ page }) => {
    await page.goto('/')
    const loginLink = page.getByRole('link', { name: /login|sign in/i }).first()
    await expect(loginLink).toBeVisible()
    await loginLink.click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated user is redirected to login from /dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated user is redirected to login from /onboarding', async ({ page }) => {
    await page.goto('/onboarding')
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated user is redirected to login from dashboard sub-pages', async ({ page }) => {
    const protectedPaths = [
      '/dashboard/kanban',
      '/dashboard/chat',
      '/dashboard/pixel-world',
      '/dashboard/approvals',
      '/dashboard/usage',
      '/dashboard/settings',
    ]
    for (const path of protectedPaths) {
      await page.goto(path)
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
    }
  })
})
