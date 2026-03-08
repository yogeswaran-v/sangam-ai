import { Page, BrowserContext } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Creates a test user in Supabase and returns their session cookies.
 * Used to skip the OAuth flow and test authenticated states directly.
 */
export async function createTestUser(email: string, password: string) {
  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Delete existing test user if present
  const { data: existing } = await admin.auth.admin.listUsers()
  const existingUser = existing?.users.find(u => u.email === email)
  if (existingUser) {
    await admin.auth.admin.deleteUser(existingUser.id)
  }

  // Create fresh user
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) throw new Error(`Failed to create test user: ${error.message}`)
  return data.user
}

/**
 * Deletes test user and all their data from Supabase.
 */
export async function cleanupTestUser(email: string) {
  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data } = await admin.auth.admin.listUsers()
  const user = data?.users.find(u => u.email === email)
  if (user) {
    // Delete customer data (cascades via FK)
    await admin.from('customers').delete().eq('user_id', user.id)
    await admin.auth.admin.deleteUser(user.id)
  }
}

/**
 * Injects a Supabase session into the browser context so tests
 * can start already authenticated without going through OAuth.
 */
export async function injectSession(context: BrowserContext, email: string, password: string) {
  const client = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error || !data.session) throw new Error(`Sign-in failed: ${error?.message}`)

  const { access_token, refresh_token } = data.session

  // Set cookies that Supabase SSR reads
  await context.addCookies([
    {
      name: 'sb-access-token',
      value: access_token,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
    },
    {
      name: 'sb-refresh-token',
      value: refresh_token,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
    },
  ])

  return data.session
}

/**
 * Sets up a fully onboarded test user with customer, mission_control,
 * agent_teams, kanban board, chat channels, and starter cards.
 */
export async function seedOnboardedUser(userId: string) {
  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Create customer
  const { data: customer } = await admin
    .from('customers')
    .insert({ user_id: userId, email: `test-${userId}@sangam.ai`, name: 'Test User', plan: 'starter' })
    .select('id')
    .single()

  if (!customer) throw new Error('Failed to create customer')

  // Mission control
  await admin.from('mission_control').insert({
    customer_id: customer.id,
    vision: 'Build the best AI SaaS platform in India',
    product_requirements: 'A multi-agent platform where founders get an AI team',
    monetary_goals: '$10K MRR in 6 months',
    timeline: 'MVP in 4 weeks, beta in 8 weeks',
    updated_by: 'ceo',
  })

  // Agent team
  await admin.from('agent_teams').insert({
    customer_id: customer.id,
    team_type: 'startup_product',
    status: 'active',
    onboarding_complete: true,
  })

  // Kanban board
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

  // Chat channels
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
