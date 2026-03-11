import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const AGENT_PROMPTS: Record<string, { name: string; prompt: string; color: string }> = {
  engineering: {
    name: 'Engineering Agent',
    color: '#4ade80',
    prompt: 'You are the Engineering Agent for a startup. You are a senior full-stack engineer. Respond to team messages with brief, technical, action-oriented replies. Max 2-3 sentences. Be helpful and direct.',
  },
  product: {
    name: 'Product Agent',
    color: '#38bdf8',
    prompt: 'You are the Product Agent for a startup. You are a sharp product manager focused on user value and shipping. Respond to team messages with brief, insight-driven replies. Max 2-3 sentences.',
  },
  marketing: {
    name: 'Marketing Agent',
    color: '#fb923c',
    prompt: 'You are the Marketing Agent for a startup. You handle growth, content, and brand. Respond to team messages with energetic, creative, brief replies. Max 2-3 sentences.',
  },
  sales: {
    name: 'Sales Agent',
    color: '#f472b6',
    prompt: 'You are the Sales Agent for a startup. You focus on customer acquisition and revenue. Respond with confident, brief, actionable replies. Max 2-3 sentences.',
  },
  finance: {
    name: 'Finance Agent',
    color: '#14b8a6',
    prompt: 'You are the Finance Agent for a startup. You handle budgets, forecasts, and financial health. Respond with precise, numbers-aware, brief replies. Max 2-3 sentences.',
  },
  general: {
    name: 'CEO Agent',
    color: '#a78bfa',
    prompt: 'You are the CEO Agent for a startup. You coordinate the team and make strategic decisions. Respond with brief, decisive, leadership-oriented replies. Max 2-3 sentences.',
  },
}

export async function POST(request: Request) {
  try {
    const { channelId, customerId, userMessage } = await request.json()
    if (!channelId || !customerId || !userMessage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
    }

    const supabase = await createClient()

    // Get channel to find department
    const { data: channel } = await supabase
      .from('chat_channels')
      .select('department, name')
      .eq('id', channelId)
      .single()

    const dept = channel?.department ?? 'general'
    const agentConfig = AGENT_PROMPTS[dept] ?? AGENT_PROMPTS.general

    // Get last 6 messages for context
    const { data: recent } = await supabase
      .from('chat_messages')
      .select('sender_name, sender_type, content')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })
      .limit(6)

    const contextMsgs = (recent ?? []).reverse().map(m =>
      `${m.sender_name}: ${m.content}`
    ).join('\n')

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: agentConfig.prompt,
      messages: [
        {
          role: 'user',
          content: contextMsgs
            ? `Recent channel context:\n${contextMsgs}\n\nLatest message from CEO: ${userMessage}`
            : userMessage,
        },
      ],
    })

    const reply = response.content[0].type === 'text' ? response.content[0].text : ''
    if (!reply) return NextResponse.json({ ok: true })

    // Insert agent response
    await supabase.from('chat_messages').insert({
      channel_id: channelId,
      sender_name: agentConfig.name,
      sender_type: 'agent',
      content: reply,
    })

    // Log token usage
    try {
      await supabase.from('token_usage').insert({
        customer_id: customerId,
        agent_id: dept,
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        cost_usd: (response.usage.input_tokens * 0.00000025) + (response.usage.output_tokens * 0.000001),
        model: 'claude-haiku-4-5-20251001',
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[chat/respond]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
