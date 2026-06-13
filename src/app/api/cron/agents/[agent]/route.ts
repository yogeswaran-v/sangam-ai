import { NextResponse } from 'next/server'
import { runSingleAgent } from '@/lib/orchestrator/orchestrator'

const VALID_AGENTS = ['ceo', 'product', 'engineering', 'marketing', 'sales', 'finance'] as const
type AgentName = typeof VALID_AGENTS[number]

// Each individual agent call fits within Vercel Hobby's 10s function limit
export const maxDuration = 10

export async function GET(
  request: Request,
  { params }: { params: Promise<{ agent: string }> }
) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { agent } = await params
  const agentName = agent as AgentName
  if (!VALID_AGENTS.includes(agentName)) {
    return NextResponse.json({ error: 'Unknown agent' }, { status: 400 })
  }

  try {
    const result = await runSingleAgent(agentName)
    return NextResponse.json({ ok: true, agent: agentName, ...result })
  } catch (err) {
    console.error(`[cron/agents/${agent}]`, err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
