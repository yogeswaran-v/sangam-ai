import { BrowserContext } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function createTestUser(email: string, password: string) {
  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: existing } = await admin.auth.admin.listUsers()
  const existingUser = existing?.users.find(u => u.email === email)
  if (existingUser) {
    await admin.auth.admin.deleteUser(existingUser.id)
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) throw new Error(`Failed to create test user: ${error.message}`)
  return data.user
}

export async function cleanupTestUser(email: string) {
  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data } = await admin.auth.admin.listUsers()
  const user = data?.users.find(u => u.email === email)
  if (user) {
    await admin.from('customers').delete().eq('user_id', user.id)
    await admin.auth.admin.deleteUser(user.id)
  }
}

/**
 * Signs in a test user via the /api/test-auth endpoint so that
 * Supabase SSR sets cookies in the exact format the server expects.
 * Works correctly with @supabase/ssr cookie chunking.
 */
export async function injectSession(
  context: BrowserContext,
  email: string,
  password: string
) {
  const page = await context.newPage()
  try {
    // Visit the app first to establish the localhost origin
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' })

    // Call the test-only auth API — the server sets SSR cookies correctly
    const result = await page.evaluate(async ({ email, password }: { email: string; password: string }) => {
      const res = await fetch('/api/test-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      return res.json()
    }, { email, password })

    if (!result.success) {
      throw new Error(`injectSession failed: ${result.error}`)
    }
  } finally {
    await page.close()
  }
}

export async function seedOnboardedUser(userId: string) {
  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: customer } = await admin
    .from('customers')
    .insert({ user_id: userId, email: `test-${userId}@sangam.ai`, name: 'Test User', plan: 'starter' })
    .select('id')
    .single()

  if (!customer) throw new Error('Failed to create customer')

  await admin.from('mission_control').insert({
    customer_id: customer.id,
    vision: 'Build the best AI SaaS platform in India',
    product_requirements: 'A multi-agent platform where founders get an AI team',
    monetary_goals: '$10K MRR in 6 months',
    timeline: 'MVP in 4 weeks, beta in 8 weeks',
    updated_by: 'ceo',
  })

  await admin.from('agent_teams').insert({
    customer_id: customer.id,
    team_type: 'startup_product',
    status: 'active',
    onboarding_complete: true,
  })

  const { data: board } = await admin
    .from('kanban_boards')
    .insert({ customer_id: customer.id })
    .select('id')
    .single()

  if (board) {
    await admin.from('kanban_cards').insert([
      { board_id: board.id, title: 'Define MVP scope', column_name: 'backlog', priority: 'high', assigned_agent: 'Product Agent' },
      { board_id: board.id, title: 'Set up architecture', column_name: 'in_progress', priority: 'high', assigned_agent: 'Engineering Agent' },
      { board_id: board.id, title: 'Go-to-market strategy', column_name: 'review', priority: 'medium', assigned_agent: 'Marketing Agent' },
    ])
  }

  const channels = [
    { name: 'CEO Updates', department: 'leadership' },
    { name: 'Engineering', department: 'engineering' },
    { name: 'Product', department: 'product' },
    { name: 'Marketing', department: 'marketing' },
    { name: 'Sales', department: 'sales' },
    { name: 'Finance', department: 'finance' },
  ]

  for (const ch of channels) {
    const { data: channel } = await admin
      .from('chat_channels')
      .insert({ customer_id: customer.id, name: ch.name, department: ch.department })
      .select('id')
      .single()

    if (channel && ch.name === 'CEO Updates') {
      await admin.from('chat_messages').insert({
        channel_id: channel.id,
        sender_name: 'CEO Agent',
        sender_type: 'agent',
        content: '🚀 Mission briefing received. Your AI team is assembled and ready.',
      })
    }
  }

  return customer
}
