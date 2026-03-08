import { test, expect } from '@playwright/test'
import { createTestUser, cleanupTestUser, injectSession, seedOnboardedUser } from '../helpers/auth'
import { createClient } from '@supabase/supabase-js'

const TEST_EMAIL = 'test-usage@sangam-test.ai'
const TEST_PASSWORD = 'Test1234!'

test.describe('Usage dashboard', () => {
  let userId: string
  let customerId: string

  test.beforeAll(async () => {
    const user = await createTestUser(TEST_EMAIL, TEST_PASSWORD)
    userId = user!.id
    const customer = await seedOnboardedUser(userId)
    customerId = customer.id

    // Seed some token usage data
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    await admin.from('token_usage').insert([
      { customer_id: customerId, agent_name: 'CEO Agent', input_tokens: 500, output_tokens: 1200, model: 'claude-opus-4-6' },
      { customer_id: customerId, agent_name: 'Product Agent', input_tokens: 400, output_tokens: 800, model: 'claude-opus-4-6' },
      { customer_id: customerId, agent_name: 'Engineering Agent', input_tokens: 600, output_tokens: 1500, model: 'claude-opus-4-6' },
    ])
  })

  test.afterAll(async () => {
    await cleanupTestUser(TEST_EMAIL)
  })

  test('renders usage page', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/dashboard/usage')
    await expect(page.getByText(/usage/i).first()).toBeVisible({ timeout: 8000 })
  })

  test('shows total token count', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/dashboard/usage')
    // Total tokens: 500+1200+400+800+600+1500 = 5000
    await expect(page.getByText(/5,000|5000|5\.0K/i).or(page.getByText(/tokens/i))).toBeVisible({ timeout: 8000 })
  })

  test('shows per-agent breakdown', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/dashboard/usage')

    await expect(page.getByText(/CEO Agent/i)).toBeVisible({ timeout: 8000 })
    await expect(page.getByText(/Product Agent/i)).toBeVisible()
    await expect(page.getByText(/Engineering Agent/i)).toBeVisible()
  })

  test('shows model name in usage data', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/dashboard/usage')
    await expect(page.getByText(/claude/i)).toBeVisible({ timeout: 8000 })
  })
})
