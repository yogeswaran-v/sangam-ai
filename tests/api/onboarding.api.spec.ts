/**
 * API-level tests for POST /api/onboarding
 *
 * TDD layer 1: These tests exercise the real server code path
 * with real auth cookies — the same path a real user hits.
 * No service-role shortcuts. No UI. Fast and precise.
 *
 * These tests would have caught the RLS bug immediately.
 */
import { test, expect } from '@playwright/test'
import { createTestUser, cleanupTestUser, injectSession } from '../helpers/auth'
import { createClient } from '@supabase/supabase-js'

const EMAIL = 'api-test-onboarding@sangam-test.ai'
const PASSWORD = 'Test1234!'

const VALID_PAYLOAD = {
  vision: 'Build AI tools for Indian founders',
  product_requirements: 'A multi-agent SaaS platform',
  monetary_goals: '$10K MRR in 6 months',
  timeline: 'MVP in 4 weeks',
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

test.describe('POST /api/onboarding', () => {
  test.beforeAll(async () => {
    await cleanupTestUser(EMAIL)
    await createTestUser(EMAIL, PASSWORD)
  })

  test.afterAll(async () => {
    await cleanupTestUser(EMAIL)
  })

  // ─── AUTH GUARD ───────────────────────────────────────────────

  test('returns 401 when called without authentication', async ({ request }) => {
    const res = await request.post('/api/onboarding', {
      data: VALID_PAYLOAD,
    })
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Not authenticated')
  })

  // ─── HAPPY PATH ───────────────────────────────────────────────

  test('returns 200 and success:true for authenticated user with valid payload', async ({ context }) => {
    await injectSession(context, EMAIL, PASSWORD)

    const res = await context.request.post('/api/onboarding', {
      data: VALID_PAYLOAD,
    })

    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  test('creates customer record in database', async ({ context }) => {
    await injectSession(context, EMAIL, PASSWORD)

    await context.request.post('/api/onboarding', { data: VALID_PAYLOAD })

    // Verify using admin client
    const admin = adminClient()
    const { data: users } = await admin.auth.admin.listUsers()
    const user = users.users.find(u => u.email === EMAIL)
    expect(user).toBeTruthy()

    const { data: customer } = await admin
      .from('customers')
      .select('id, email')
      .eq('user_id', user!.id)
      .single()

    expect(customer).toBeTruthy()
    expect(customer!.email).toBe(EMAIL)
  })

  test('creates agent_team with onboarding_complete=true', async ({ context }) => {
    await injectSession(context, EMAIL, PASSWORD)
    await context.request.post('/api/onboarding', { data: VALID_PAYLOAD })

    const admin = adminClient()
    const { data: users } = await admin.auth.admin.listUsers()
    const user = users.users.find(u => u.email === EMAIL)!

    const { data: customer } = await admin
      .from('customers').select('id').eq('user_id', user.id).single()

    const { data: team } = await admin
      .from('agent_teams')
      .select('onboarding_complete, status, team_type')
      .eq('customer_id', customer!.id)
      .single()

    expect(team).toBeTruthy()
    expect(team!.onboarding_complete).toBe(true)
    expect(team!.status).toBe('active')
    expect(team!.team_type).toBe('startup_product')
  })

  test('saves mission_control data correctly', async ({ context }) => {
    await injectSession(context, EMAIL, PASSWORD)
    await context.request.post('/api/onboarding', { data: VALID_PAYLOAD })

    const admin = adminClient()
    const { data: users } = await admin.auth.admin.listUsers()
    const user = users.users.find(u => u.email === EMAIL)!
    const { data: customer } = await admin
      .from('customers').select('id').eq('user_id', user.id).single()

    const { data: mc } = await admin
      .from('mission_control')
      .select('vision, product_requirements, monetary_goals, timeline')
      .eq('customer_id', customer!.id)
      .single()

    expect(mc!.vision).toBe(VALID_PAYLOAD.vision)
    expect(mc!.product_requirements).toBe(VALID_PAYLOAD.product_requirements)
    expect(mc!.monetary_goals).toBe(VALID_PAYLOAD.monetary_goals)
    expect(mc!.timeline).toBe(VALID_PAYLOAD.timeline)
  })

  test('creates 6 chat channels', async ({ context }) => {
    await injectSession(context, EMAIL, PASSWORD)
    await context.request.post('/api/onboarding', { data: VALID_PAYLOAD })

    const admin = adminClient()
    const { data: users } = await admin.auth.admin.listUsers()
    const user = users.users.find(u => u.email === EMAIL)!
    const { data: customer } = await admin
      .from('customers').select('id').eq('user_id', user.id).single()

    const { data: channels } = await admin
      .from('chat_channels')
      .select('name, department')
      .eq('customer_id', customer!.id)
      .order('name')

    expect(channels).toHaveLength(6)
    const names = channels!.map(c => c.name)
    expect(names).toContain('CEO Updates')
    expect(names).toContain('Engineering')
    expect(names).toContain('Product')
    expect(names).toContain('Marketing')
    expect(names).toContain('Sales')
    expect(names).toContain('Finance')
  })

  test('creates 3 kanban cards in backlog', async ({ context }) => {
    await injectSession(context, EMAIL, PASSWORD)
    await context.request.post('/api/onboarding', { data: VALID_PAYLOAD })

    const admin = adminClient()
    const { data: users } = await admin.auth.admin.listUsers()
    const user = users.users.find(u => u.email === EMAIL)!
    const { data: customer } = await admin
      .from('customers').select('id').eq('user_id', user.id).single()

    const { data: board } = await admin
      .from('kanban_boards').select('id').eq('customer_id', customer!.id).single()

    const { data: cards } = await admin
      .from('kanban_cards')
      .select('title, column_name')
      .eq('board_id', board!.id)

    expect(cards).toHaveLength(3)
    cards!.forEach(card => expect(card.column_name).toBe('backlog'))
  })

  test('posts welcome message in CEO Updates channel', async ({ context }) => {
    await injectSession(context, EMAIL, PASSWORD)
    await context.request.post('/api/onboarding', { data: VALID_PAYLOAD })

    const admin = adminClient()
    const { data: users } = await admin.auth.admin.listUsers()
    const user = users.users.find(u => u.email === EMAIL)!
    const { data: customer } = await admin
      .from('customers').select('id').eq('user_id', user.id).single()

    const { data: ceoChannel } = await admin
      .from('chat_channels')
      .select('id')
      .eq('customer_id', customer!.id)
      .eq('name', 'CEO Updates')
      .single()

    const { data: messages } = await admin
      .from('chat_messages')
      .select('content, sender_name, sender_type')
      .eq('channel_id', ceoChannel!.id)

    expect(messages).toHaveLength(1)
    expect(messages![0].sender_name).toBe('CEO Agent')
    expect(messages![0].sender_type).toBe('agent')
    expect(messages![0].content).toContain('Mission briefing received')
  })

  // ─── IDEMPOTENCY ─────────────────────────────────────────────

  test('calling twice is idempotent — no duplicate records', async ({ context }) => {
    await injectSession(context, EMAIL, PASSWORD)

    // Call twice
    await context.request.post('/api/onboarding', { data: VALID_PAYLOAD })
    const res2 = await context.request.post('/api/onboarding', { data: VALID_PAYLOAD })

    expect(res2.status()).toBe(200)

    const admin = adminClient()
    const { data: users } = await admin.auth.admin.listUsers()
    const user = users.users.find(u => u.email === EMAIL)!
    const { data: customer } = await admin
      .from('customers').select('id').eq('user_id', user.id).single()

    // Still exactly 1 team
    const { data: teams } = await admin
      .from('agent_teams').select('id').eq('customer_id', customer!.id)
    expect(teams).toHaveLength(1)

    // Still exactly 6 channels (no duplicates)
    const { data: channels } = await admin
      .from('chat_channels').select('id').eq('customer_id', customer!.id)
    expect(channels).toHaveLength(6)
  })
})
