import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    // Verify the user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (!customer) return NextResponse.json({ error: 'No customer' }, { status: 404 })

    const cid = customer.id

    // Use service role to bypass RLS for deletes (most tables have no user DELETE policy)
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Delete chat messages via channel IDs
    const { data: channels } = await admin
      .from('chat_channels')
      .select('id')
      .eq('customer_id', cid)
    if (channels && channels.length > 0) {
      await admin.from('chat_messages').delete().in('channel_id', channels.map(r => r.id))
    }

    // Delete kanban_boards (cascades to kanban_cards via FK)
    await admin.from('kanban_boards').delete().eq('customer_id', cid)

    await admin.from('approval_requests').delete().eq('customer_id', cid)
    await admin.from('agent_events').delete().eq('customer_id', cid)
    await admin.from('part_time_deployments').delete().eq('customer_id', cid)
    await admin.from('token_usage').delete().eq('customer_id', cid)
    await admin.from('mission_control').update({
      vision: null,
      product_requirements: null,
      monetary_goals: null,
      timeline: null,
      updated_at: new Date().toISOString(),
    }).eq('customer_id', cid)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[settings/reset]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
