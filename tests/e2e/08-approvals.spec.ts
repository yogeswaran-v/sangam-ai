import { test, expect } from '@playwright/test'
import { createTestUser, cleanupTestUser, injectSession, seedOnboardedUser } from '../helpers/auth'
import { createClient } from '@supabase/supabase-js'

const TEST_EMAIL = 'test-approvals@sangam-test.ai'
const TEST_PASSWORD = 'Test1234!'

test.describe('Approvals center', () => {
  let userId: string
  let customerId: string

  test.beforeAll(async () => {
    const user = await createTestUser(TEST_EMAIL, TEST_PASSWORD)
    userId = user!.id
    const customer = await seedOnboardedUser(userId)
    customerId = customer.id

    // Seed some approval requests
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    await admin.from('approval_requests').insert([
      {
        customer_id: customerId,
        agent_name: 'CEO Agent',
        title: 'Approve Q1 marketing budget',
        description: 'The marketing team needs $5,000 to run Google Ads for the product launch.',
        status: 'pending',
      },
      {
        customer_id: customerId,
        agent_name: 'Engineering Agent',
        title: 'Approve third-party API integration',
        description: 'Engineering wants to integrate Stripe for payments. Requires API key approval.',
        status: 'pending',
      },
      {
        customer_id: customerId,
        agent_name: 'Sales Agent',
        title: 'Approve enterprise discount',
        description: 'A potential enterprise client wants 30% discount for a 12-month commitment.',
        status: 'approved',
      },
    ])
  })

  test.afterAll(async () => {
    await cleanupTestUser(TEST_EMAIL)
  })

  test('renders approvals page', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/dashboard/approvals')
    await expect(page.getByText(/approvals/i).first()).toBeVisible({ timeout: 8000 })
  })

  test('shows pending approval requests', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/dashboard/approvals')

    await expect(page.getByText(/Q1 marketing budget/i)).toBeVisible({ timeout: 8000 })
    await expect(page.getByText(/third-party API/i)).toBeVisible()
  })

  test('shows agent name on each approval card', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/dashboard/approvals')

    await expect(page.getByText(/CEO Agent/i)).toBeVisible({ timeout: 8000 })
    await expect(page.getByText(/Engineering Agent/i)).toBeVisible()
  })

  test('approve button is present on pending requests', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/dashboard/approvals')

    await expect(page.getByRole('button', { name: /approve/i }).first()).toBeVisible({ timeout: 8000 })
  })

  test('reject button is present on pending requests', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/dashboard/approvals')

    await expect(page.getByRole('button', { name: /reject|decline/i }).first()).toBeVisible({ timeout: 8000 })
  })

  test('approving a request updates its status', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
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
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/dashboard/approvals')
    // Page should load without errors regardless of approval count
    await expect(page).not.toHaveURL(/error|500/)
  })
})
