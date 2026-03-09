import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  // Verify authenticated user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { vision, product_requirements, monetary_goals, timeline } = await req.json()

  // Use service role to bypass RLS for onboarding writes
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    // 1. Get or create customer
    let { data: customer } = await admin
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!customer) {
      const { data: newCustomer, error: createError } = await admin
        .from('customers')
        .insert({ user_id: user.id, email: user.email ?? '', name: user.user_metadata?.full_name ?? '' })
        .select('id')
        .single()

      if (createError) {
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
      }
      customer = newCustomer
    }

    // 2. Upsert mission control
    const { error: mcError } = await admin
      .from('mission_control')
      .upsert({
        customer_id: customer!.id,
        vision: vision ?? '',
        product_requirements: product_requirements ?? '',
        monetary_goals: monetary_goals ?? '',
        timeline: timeline ?? '',
        updated_by: 'ceo',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'customer_id' })

    if (mcError) {
      return NextResponse.json({ error: 'Failed to save mission data' }, { status: 500 })
    }

    // 3. Mark onboarding complete (manual upsert — agent_teams may lack unique constraint)
    const { data: existingTeam } = await admin
      .from('agent_teams')
      .select('id')
      .eq('customer_id', customer!.id)
      .single()

    if (existingTeam) {
      const { error: teamError } = await admin
        .from('agent_teams')
        .update({ status: 'active', onboarding_complete: true })
        .eq('id', existingTeam.id)
      if (teamError) {
        return NextResponse.json({ error: 'Failed to update team' }, { status: 500 })
      }
    } else {
      const { error: teamError } = await admin
        .from('agent_teams')
        .insert({
          customer_id: customer!.id,
          team_type: 'startup_product',
          status: 'active',
          onboarding_complete: true,
        })
      if (teamError) {
        return NextResponse.json({ error: 'Failed to create team' }, { status: 500 })
      }
    }

    // 4. Create kanban board
    const { data: kanbanBoard } = await admin
      .from('kanban_boards')
      .upsert({ customer_id: customer!.id }, { onConflict: 'customer_id' })
      .select('id')
      .single()

    // 5. Create chat channels
    const CHANNELS = [
      { name: 'CEO Updates', department: 'leadership' },
      { name: 'Engineering', department: 'engineering' },
      { name: 'Product', department: 'product' },
      { name: 'Marketing', department: 'marketing' },
      { name: 'Sales', department: 'sales' },
      { name: 'Finance', department: 'finance' },
    ]

    for (const ch of CHANNELS) {
      const { data: existing } = await admin
        .from('chat_channels')
        .select('id')
        .eq('customer_id', customer!.id)
        .eq('name', ch.name)
        .single()

      if (!existing) {
        await admin.from('chat_channels').insert({
          customer_id: customer!.id,
          name: ch.name,
          department: ch.department,
        })
      }
    }

    // 6. Seed starter kanban cards (only if board is empty)
    if (kanbanBoard) {
      const { count } = await admin
        .from('kanban_cards')
        .select('id', { count: 'exact', head: true })
        .eq('board_id', kanbanBoard.id)

      if ((count ?? 0) === 0) {
        const starterCards = [
          { title: 'Define MVP feature scope', description: 'CEO Agent: Break down product requirements into a prioritised MVP feature list', priority: 'high', assigned_agent: 'Product Agent' },
          { title: 'Set up project architecture', description: 'Engineering Agent: Define tech stack, repo structure, and development workflow', priority: 'high', assigned_agent: 'Engineering Agent' },
          { title: 'Create go-to-market strategy', description: 'Marketing Agent: Identify target audience, messaging, and launch channels', priority: 'medium', assigned_agent: 'Marketing Agent' },
        ]

        for (const card of starterCards) {
          await admin.from('kanban_cards').insert({
            board_id: kanbanBoard.id,
            ...card,
            column_name: 'backlog',
          })
        }
      }

      // 7. Post welcome message to CEO Updates (only once)
      const { data: ceoChannel } = await admin
        .from('chat_channels')
        .select('id')
        .eq('customer_id', customer!.id)
        .eq('name', 'CEO Updates')
        .single()

      if (ceoChannel) {
        const { count: msgCount } = await admin
          .from('chat_messages')
          .select('id', { count: 'exact', head: true })
          .eq('channel_id', ceoChannel.id)

        if ((msgCount ?? 0) === 0) {
          await admin.from('chat_messages').insert({
            channel_id: ceoChannel.id,
            sender_name: 'CEO Agent',
            sender_type: 'agent',
            content: `Mission briefing received.\n\nI've reviewed your vision and goals. Your AI team is now assembled and ready.\n\nToday's priorities:\n- Define the MVP scope with the Product team\n- Set up the engineering foundation\n- Begin market research\n\nI'll send daily briefings here. The team will post updates in their respective channels. Let's build something great.`,
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Onboarding error:', err?.message ?? err)
    return NextResponse.json({ error: err?.message ?? 'Something went wrong' }, { status: 500 })
  }
}
