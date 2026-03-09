import { test, expect } from '@playwright/test'
import { createTestUser, cleanupTestUser, injectSession } from '../helpers/auth'
import { createClient } from '@supabase/supabase-js'

/**
 * CRITICAL E2E TEST: Fresh user journey
 *
 * This test verifies the REAL user experience — no pre-seeded data,
 * no service role shortcuts. A fresh user signs up, gets redirected
 * to onboarding, completes it via the /api/onboarding route, lands
 * on the dashboard, and verifies all seeded data exists.
 *
 * This test would have caught the RLS bug that blocked onboarding
 * in production.
 */

const FRESH_EMAIL = 'fresh-e2e@sangam-test.ai'
const FRESH_PASSWORD = 'Test1234!'

test.describe('Fresh user end-to-end journey', () => {
  test.beforeAll(async () => {
    await cleanupTestUser(FRESH_EMAIL)
    await createTestUser(FRESH_EMAIL, FRESH_PASSWORD)
  })

  test.afterAll(async () => {
    await cleanupTestUser(FRESH_EMAIL)
  })

  test('fresh user visiting /dashboard is redirected to /onboarding', async ({ page, context }) => {
    await injectSession(context, FRESH_EMAIL, FRESH_PASSWORD)
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 })
  })

  test('fresh user completes onboarding and sees working dashboard', async ({ page, context }) => {
    await injectSession(context, FRESH_EMAIL, FRESH_PASSWORD)

    // Start at dashboard — should redirect to onboarding
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 })

    // Fill all 4 steps
    const answers = [
      'Build AI tools for Indian startups',
      'A platform that gives every founder an AI team',
      'Reach $5K MRR in 3 months',
      'MVP in 2 weeks, beta in 4 weeks',
    ]

    const nextBtn = page.getByRole('button', { name: /next →/i })
      .or(page.getByRole('button', { name: 'Next →' }))
      .last()

    // Intercept the API call
    const apiPromise = page.waitForResponse(resp =>
      resp.url().includes('/api/onboarding') && resp.request().method() === 'POST'
    )

    for (let i = 0; i < answers.length; i++) {
      await expect(page.getByText(`Step ${i + 1} of 4`)).toBeVisible()
      await page.getByRole('textbox').fill(answers[i])
      if (i < answers.length - 1) {
        await nextBtn.click()
        await page.waitForTimeout(300)
      } else {
        await page.getByRole('button', { name: /launch my team/i }).click()
      }
    }

    // Verify API succeeded
    const apiResponse = await apiPromise
    expect(apiResponse.status()).toBe(200)

    // Should land on dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })

    // Dashboard should show mission control content
    await expect(page.getByText(/mission control/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('[diagnostic] verify DB state after onboarding', async () => {
    // Directly check DB — no browser needed
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data: users } = await admin.auth.admin.listUsers()
    const user = users.users.find(u => u.email === FRESH_EMAIL)
    expect(user, `User ${FRESH_EMAIL} not found in DB`).toBeTruthy()

    const { data: customer } = await admin.from('customers').select('id').eq('user_id', user!.id).single()
    expect(customer, 'Customer record missing').toBeTruthy()

    const { data: team } = await admin.from('agent_teams').select('onboarding_complete').eq('customer_id', customer!.id).single()
    expect(team, 'agent_teams record missing').toBeTruthy()
    expect(team!.onboarding_complete, 'onboarding_complete should be true').toBe(true)
  })

  test('after onboarding — kanban has seeded cards', async ({ page, context }) => {
    await injectSession(context, FRESH_EMAIL, FRESH_PASSWORD)
    await page.goto('/dashboard/kanban')

    // Cards created by /api/onboarding
    await expect(page.getByText(/Define MVP feature scope/i)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/Set up project architecture/i)).toBeVisible()
    await expect(page.getByText(/go-to-market strategy/i)).toBeVisible()
  })

  test('after onboarding — chat has channels and welcome message', async ({ page, context }) => {
    await injectSession(context, FRESH_EMAIL, FRESH_PASSWORD)
    await page.goto('/dashboard/chat')
    await expect(page.getByRole('button', { name: /CEO Updates/i })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: /Engineering/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Product/i })).toBeVisible()

    // Click CEO Updates channel then wait for welcome message
    await page.getByRole('button', { name: /CEO Updates/i }).click()
    await expect(page.getByText(/mission briefing received/i)).toBeVisible({ timeout: 10000 })
  })

  test('after onboarding — usage page loads without error', async ({ page, context }) => {
    await injectSession(context, FRESH_EMAIL, FRESH_PASSWORD)
    const response = await page.goto('/dashboard/usage')
    // Must not 500 — fresh user may have no usage data (empty state is fine)
    expect(response?.status()).toBeLessThan(500)
    await expect(page).not.toHaveURL(/\/login|\/onboarding/, { timeout: 5000 })
  })

  test('after onboarding — settings page loads', async ({ page, context }) => {
    await injectSession(context, FRESH_EMAIL, FRESH_PASSWORD)
    await page.goto('/dashboard/settings')
    // Page loads without redirect to login or onboarding
    await expect(page).not.toHaveURL(/\/login|\/onboarding/, { timeout: 8000 })
    // Settings form should be visible
    await expect(page.locator('form, [data-testid="settings"], h1, h2').first()).toBeVisible({ timeout: 8000 })
  })

  test('after onboarding — /onboarding redirects back to dashboard', async ({ page, context }) => {
    await injectSession(context, FRESH_EMAIL, FRESH_PASSWORD)
    await page.goto('/onboarding')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })
})
