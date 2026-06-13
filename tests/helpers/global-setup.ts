import { createTestUser, cleanupTestUser, seedOnboardedUser } from './auth'
import { createClient } from '@supabase/supabase-js'

// Single shared onboarded user reused across all dashboard test suites
export const SHARED_EMAIL = 'shared-e2e@sangam-test.ai'
export const SHARED_PASSWORD = 'Test1234!'

export default async function globalSetup() {
  console.log('🔧 Global setup: creating shared test user...')

  await cleanupTestUser(SHARED_EMAIL)
  const user = await createTestUser(SHARED_EMAIL, SHARED_PASSWORD)
  const customer = await seedOnboardedUser(user!.id)

  // Seed approval requests
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  // NOTE: approval_requests has no agent_name column (see 002_kanban_chat_events.sql)
  const { error: approvalError } = await admin.from('approval_requests').insert([
    {
      customer_id: customer.id,
      title: 'Approve Q1 marketing budget',
      description: 'The marketing team needs $5,000 to run Google Ads.',
      status: 'pending',
    },
    {
      customer_id: customer.id,
      title: 'Approve third-party API integration',
      description: 'Engineering wants to integrate Stripe for payments.',
      status: 'pending',
    },
  ])
  if (approvalError) throw new Error(`Failed to seed approval_requests: ${approvalError.message}`)

  // Seed token usage (token_usage has no model column — agent_name/tokens/cost only)
  const { error: usageError } = await admin.from('token_usage').insert([
    { customer_id: customer.id, agent_name: 'CEO Agent', input_tokens: 500, output_tokens: 1200, cost_usd: 0.05 },
    { customer_id: customer.id, agent_name: 'Product Agent', input_tokens: 400, output_tokens: 800, cost_usd: 0.03 },
    { customer_id: customer.id, agent_name: 'Engineering Agent', input_tokens: 600, output_tokens: 1500, cost_usd: 0.06 },
  ])
  if (usageError) throw new Error(`Failed to seed token_usage: ${usageError.message}`)

  console.log(`✓ Shared test user ready: ${SHARED_EMAIL}`)
}

export async function globalTeardown() {
  console.log('🧹 Global teardown: cleaning up shared test user...')
  await cleanupTestUser(SHARED_EMAIL)
  console.log('✓ Cleanup complete')
}
