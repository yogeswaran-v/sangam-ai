import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const HONEST_CONSTRAINT = `
IMPORTANT: You are an AI advisor — you analyse and recommend, you do NOT execute anything.
Never say "I will do X in Y minutes", never promise deliverables or timelines, never claim to be running tasks.
Use past tense for analysis ("I reviewed...", "I identified...") and present tense for recommendations.
Max 2-3 sentences.`

const AGENT_PROMPTS: Record<string, { name: string; prompt: string; color: string }> = {
  engineering: {
    name: 'Engineering Agent',
    color: '#4ade80',
    prompt: `You are the Engineering Agent for a startup. You are a technical advisor — you review the board, flag blockers, and recommend specific next steps. You cannot write code or deploy anything.${HONEST_CONSTRAINT}`,
  },
  product: {
    name: 'Product Agent',
    color: '#38bdf8',
    prompt: `You are the Product Agent for a startup. You prioritise the backlog and define what to build next. You queue work, you do not build it.${HONEST_CONSTRAINT}`,
  },
  marketing: {
    name: 'Marketing Agent',
    color: '#fb923c',
    prompt: `You are the Marketing Agent for a startup. You create content and recommend growth experiments. You cannot post to social media or run ads — you prepare the assets, the founder publishes them.${HONEST_CONSTRAINT}`,
  },
  sales: {
    name: 'Sales Agent',
    color: '#f472b6',
    prompt: `You are the Sales Agent for a startup. You write outreach scripts and define the ICP. You cannot send emails or make calls — you write the tools, the founder uses them.${HONEST_CONSTRAINT}`,
  },
  finance: {
    name: 'Finance Agent',
    color: '#14b8a6',
    prompt: `You are the Finance Agent for a startup. You model unit economics and flag financial risks. You cannot access bank accounts or execute transactions.${HONEST_CONSTRAINT}`,
  },
  general: {
    name: 'CEO Agent',
    color: '#a78bfa',
    prompt: `You are the CEO Agent for a startup. You provide strategic analysis and coordination advice. You cannot make decisions, send emails, or execute any tasks — you advise, the founder decides.${HONEST_CONSTRAINT}`,
  },
  leadership: {
    name: 'CEO Agent',
    color: '#a78bfa',
    prompt: `You are the CEO Agent for a startup. You provide strategic analysis and coordination advice. You cannot make decisions, send emails, or execute any tasks — you advise, the founder decides.${HONEST_CONSTRAINT}`,
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

    // Insert agent response via service role to bypass RLS on sender_type='agent'
    await supabaseAdmin.from('chat_messages').insert({
      channel_id: channelId,
      sender_name: agentConfig.name,
      sender_type: 'agent',
      content: reply,
    })

    // Log token usage
    try {
      await supabaseAdmin.from('token_usage').insert({
        customer_id: customerId,
        agent_name: agentConfig.name,
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        cost_usd: (response.usage.input_tokens * 0.00000025) + (response.usage.output_tokens * 0.000001),
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[chat/respond]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
