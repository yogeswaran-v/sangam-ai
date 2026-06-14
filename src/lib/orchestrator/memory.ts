import { supabaseAdmin } from '@/lib/supabase/admin'
import type { AgentContext, AgentState } from './types'

export async function buildWorldState(
  ctx: AgentContext,
  agentName: string,
  channelName: string,
  state: AgentState
): Promise<string> {
  const dateStr = new Date().toISOString().substring(0, 10)
  const parts: string[] = [`## World State — ${agentName} — ${dateStr}`]

  if (state.current_focus) parts.push(`**Your focus:** ${state.current_focus}`)
  if (state.last_event_summary) parts.push(`**Last action:** ${state.last_event_summary}`)
  if (state.last_action_at) parts.push(`**Last active:** ${state.last_action_at.substring(0, 16)}Z`)

  // Recent channel messages
  const { data: channel } = await supabaseAdmin
    .from('chat_channels')
    .select('id')
    .eq('customer_id', ctx.customerId)
    .eq('name', channelName)
    .single()

  parts.push(`\n### ${channelName} (last 6 messages)`)
  if (channel) {
    const { data: msgs } = await supabaseAdmin
      .from('chat_messages')
      .select('sender_name, sender_type, content, created_at')
      .eq('channel_id', channel.id)
      .order('created_at', { ascending: false })
      .limit(6)

    const messages = (msgs ?? []).reverse()
    if (messages.length > 0) {
      for (const msg of messages) {
        const role = msg.sender_type === 'ceo' ? 'Founder' : msg.sender_name
        const preview = msg.content.substring(0, 200).replace(/\n+/g, ' ')
        parts.push(`${role}: ${preview}`)
      }
    } else {
      parts.push('(empty)')
    }
  } else {
    parts.push('(channel not found)')
  }

  // Kanban cards assigned to this agent
  const { data: board } = await supabaseAdmin
    .from('kanban_boards')
    .select('id')
    .eq('customer_id', ctx.customerId)
    .single()

  parts.push('\n### Your kanban cards')
  if (board) {
    const { data: cards } = await supabaseAdmin
      .from('kanban_cards')
      .select('id, title, column_name, priority')
      .eq('board_id', board.id)
      .eq('assigned_agent', agentName)
      .neq('column_name', 'done')
      .order('created_at', { ascending: false })
      .limit(8)

    if (cards && cards.length > 0) {
      for (const card of cards) {
        parts.push(`[${card.column_name}] ${card.title} (${card.priority}) id:${card.id}`)
      }
    } else {
      parts.push('(none)')
    }
  } else {
    parts.push('(no board found)')
  }

  // Pending and recently-resolved approvals
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: approvals } = await supabaseAdmin
    .from('approval_requests')
    .select('id, title, status, responded_at')
    .eq('customer_id', ctx.customerId)
    .or(`status.eq.pending,responded_at.gte.${oneDayAgo}`)
    .order('created_at', { ascending: false })
    .limit(5)

  parts.push('\n### Approvals')
  if (approvals && approvals.length > 0) {
    for (const a of approvals) {
      const label = a.status === 'pending' ? 'pending' : a.status === 'approved' ? 'approved' : 'rejected'
      parts.push(`[${label}] ${a.title}`)
    }
    if (state.waiting_on_approval_id) {
      const waiting = approvals.find((a) => a.id === state.waiting_on_approval_id)
      if (waiting) {
        parts.push(`NOTE: You escalated "${waiting.title}" — it is now ${waiting.status}. Act on the outcome.`)
      }
    }
  } else {
    parts.push('(none)')
  }

  // Recent cross-agent activity (other agents only)
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  const { data: events } = await supabaseAdmin
    .from('agent_events')
    .select('agent_name, event_type')
    .eq('customer_id', ctx.customerId)
    .gte('created_at', sixHoursAgo)
    .neq('agent_name', agentName)
    .order('created_at', { ascending: false })
    .limit(4)

  if (events && events.length > 0) {
    parts.push('\n### Recent team activity')
    for (const e of events) {
      parts.push(`${e.agent_name}: ${e.event_type}`)
    }
  }

  return parts.join('\n')
}
