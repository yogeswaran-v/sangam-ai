import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
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

    // Delete in order (no FK violations expected since service role bypasses)
    await supabase.from('chat_messages').delete().in(
      'channel_id',
      (await supabase.from('chat_channels').select('id').eq('customer_id', cid)).data?.map(r => r.id) ?? []
    )
    await supabase.from('approval_requests').delete().eq('customer_id', cid)
    await supabase.from('kanban_cards').delete().eq('customer_id', cid)
    await supabase.from('agent_events').delete().eq('customer_id', cid)
    await supabase.from('part_time_deployments').delete().eq('customer_id', cid)
    await supabase.from('token_usage').delete().eq('customer_id', cid)
    await supabase.from('mission_control').update({
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
