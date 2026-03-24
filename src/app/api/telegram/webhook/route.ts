import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

// ─── Agent configurations ────────────────────────────────────────────────────

const AGENT_CONFIGS: Record<string, { name: string; prompt: string; dept: string }> = {
  ceo: {
    name: 'CEO Agent',
    dept: 'leadership',
    prompt: 'You are the CEO Agent of Sangam.ai, the strategic leader. Be decisive, motivating, and concise. Max 3 sentences.',
  },
  engineering: {
    name: 'Engineering Agent',
    dept: 'engineering',
    prompt: 'You are the Engineering Agent, a senior full-stack engineer. Be technical, direct, and action-oriented. Max 3 sentences.',
  },
  product: {
    name: 'Product Agent',
    dept: 'product',
    prompt: 'You are the Product Agent, a sharp product manager focused on user value. Be insight-driven and crisp. Max 3 sentences.',
  },
  marketing: {
    name: 'Marketing Agent',
    dept: 'marketing',
    prompt: 'You are the Marketing Agent handling growth, content, and brand. Be energetic, creative, and brief. Max 3 sentences.',
  },
  sales: {
    name: 'Sales Agent',
    dept: 'sales',
    prompt: 'You are the Sales Agent focused on customer acquisition and revenue. Be confident, brief, and actionable. Max 3 sentences.',
  },
  finance: {
    name: 'Finance Agent',
    dept: 'finance',
    prompt: 'You are the Finance Agent handling budgets and forecasts. Be precise, numbers-aware, and brief. Max 3 sentences.',
  },
}

// Maps Telegram commands to agent IDs
const COMMAND_MAP: Record<string, string> = {
  '/ceo': 'ceo',
  '/leadership': 'ceo',
  '/engineering': 'engineering',
  '/eng': 'engineering',
  '/product': 'product',
  '/pm': 'product',
  '/marketing': 'marketing',
  '/mkt': 'marketing',
  '/sales': 'sales',
  '/finance': 'finance',
  '/fin': 'finance',
}

const HELP_TEXT = `*🤖 Sangam.ai Agent Chat*

Talk directly to your AI team from Telegram\\.

*Commands:*
/ceo — Strategy & daily briefings
/engineering — Technical help & code
/product — Roadmap & product decisions
/marketing — Campaigns & growth
/sales — CRM & outreach
/finance — Budgets & forecasts
/help — Show this message

_No command? Your CEO Agent replies by default\\._`

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function sendTelegram(chatId: string, text: string, botToken: string): Promise<void> {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'MarkdownV2' }),
  })
}

function escapeMd(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&')
}

// ─── Webhook handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const message = body.message
    if (!message?.text) return NextResponse.json({ ok: true })

    const chatId = String(message.chat.id)
    const rawText = message.text.trim()

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Look up the customer who owns this Telegram chat
    const { data: customer } = await admin
      .from('customers')
      .select('id, telegram_bot_token')
      .eq('telegram_chat_id', chatId)
      .single()

    if (!customer?.telegram_bot_token) return NextResponse.json({ ok: true })

    const botToken = customer.telegram_bot_token

    // Handle /start and /help
    if (rawText === '/start' || rawText === '/help') {
      await sendTelegram(chatId, HELP_TEXT, botToken)
      return NextResponse.json({ ok: true })
    }

    // Detect agent command from first word (e.g. "/engineering ...")
    const firstWord = rawText.split(/\s+/)[0].toLowerCase()
    const agentId = COMMAND_MAP[firstWord] ?? 'ceo'
    const userMessage = COMMAND_MAP[firstWord]
      ? rawText.slice(firstWord.length).trim() || 'Give me a quick status update.'
      : rawText

    const agentConfig = AGENT_CONFIGS[agentId]

    // Load mission context for richer responses
    const { data: mission } = await admin
      .from('mission_control')
      .select('vision, product_requirements')
      .eq('customer_id', customer.id)
      .single()

    const systemPrompt = mission?.vision
      ? `${agentConfig.prompt}\n\nCompany vision: ${mission.vision}`
      : agentConfig.prompt

    // Call Claude
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const aiResponse = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    const reply = aiResponse.content[0].type === 'text' ? aiResponse.content[0].text : ''
    if (!reply) return NextResponse.json({ ok: true })

    // Format and send via Telegram
    const formatted = `*${escapeMd(agentConfig.name)}*\n\n${escapeMd(reply)}`
    await sendTelegram(chatId, formatted, botToken)

    // Mirror the conversation into the matching chat channel
    const { data: channel } = await admin
      .from('chat_channels')
      .select('id')
      .eq('customer_id', customer.id)
      .eq('department', agentConfig.dept)
      .single()

    if (channel) {
      await admin.from('chat_messages').insert([
        {
          channel_id: channel.id,
          sender_name: 'Founder (Telegram)',
          sender_type: 'ceo',
          content: userMessage,
        },
        {
          channel_id: channel.id,
          sender_name: agentConfig.name,
          sender_type: 'agent',
          content: reply,
        },
      ])
    }

    // Log token usage
    try {
      await admin.from('token_usage').insert({
        customer_id: customer.id,
        agent_name: agentConfig.name,
        input_tokens: aiResponse.usage.input_tokens,
        output_tokens: aiResponse.usage.output_tokens,
        cost_usd:
          (aiResponse.usage.input_tokens * 0.00000025) +
          (aiResponse.usage.output_tokens * 0.000001),
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[telegram/webhook]', err)
    // Always return 200 so Telegram doesn't retry
    return NextResponse.json({ ok: true })
  }
}
