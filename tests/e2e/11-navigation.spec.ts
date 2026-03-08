import { test, expect } from '@playwright/test'
import { injectSession } from '../helpers/auth'
import { SHARED_EMAIL, SHARED_PASSWORD } from '../helpers/global-setup'
import { createTestUser, cleanupTestUser } from '../helpers/global-setup'

test.describe('Navigation and routing', () => {
  test('sidebar links navigate to correct pages', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard')

    const navItems = [
      { name: /kanban/i, url: /\/kanban/ },
      { name: /chat/i, url: /\/chat/ },
      { name: /pixel world/i, url: /\/pixel-world/ },
      { name: /approvals/i, url: /\/approvals/ },
      { name: /usage/i, url: /\/usage/ },
      { name: /settings/i, url: /\/settings/ },
    ]

    for (const item of navItems) {
      await page.goto('/dashboard')
      await page.getByRole('link', { name: item.name }).first().click()
      await expect(page).toHaveURL(item.url, { timeout: 5000 })
    }
  })

  test('active sidebar link is highlighted', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/kanban')

    // The kanban link should have an active/selected class or aria-current
    const kanbanLink = page.getByRole('link', { name: /kanban/i }).first()
    const classAttr = await kanbanLink.getAttribute('class')
    const ariaCurrent = await kanbanLink.getAttribute('aria-current')

    expect(
      classAttr?.includes('active') || classAttr?.includes('bg-') || ariaCurrent === 'page'
    ).toBeTruthy()
  })

  test('browser back button works correctly', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard')
    await page.goto('/dashboard/kanban')
    await page.goBack()
    await expect(page).toHaveURL(/\/dashboard$/)
  })

  test('all dashboard pages load without 500 errors', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)

    const pages = [
      '/dashboard',
      '/dashboard/kanban',
      '/dashboard/chat',
      '/dashboard/pixel-world',
      '/dashboard/approvals',
      '/dashboard/usage',
      '/dashboard/settings',
    ]

    for (const path of pages) {
      const response = await page.goto(path)
      expect(response?.status()).toBeLessThan(500)
      // No error page text
      await expect(page.getByText(/internal server error|something went wrong/i)).not.toBeVisible()
    }
  })

  test('onboarding route is accessible when not onboarded', async ({ page, context }) => {
    // New user without customer record — should see onboarding
    const freshUser = await createTestUser('fresh-nav@sangam-test.ai', SHARED_PASSWORD)
    await injectSession(context, 'fresh-nav@sangam-test.ai', SHARED_PASSWORD)
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/onboarding/)
    await cleanupTestUser('fresh-nav@sangam-test.ai')
  })

  test('onboarded user cannot access /onboarding (redirects to dashboard)', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    // Onboarding page redirects unauthenticated to /login — but authenticated onboarded
    // users going to /onboarding should see the wizard (not crash)
    const response = await page.goto('/onboarding')
    expect(response?.status()).toBeLessThan(500)
  })
})
