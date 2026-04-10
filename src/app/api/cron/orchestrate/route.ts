import { NextResponse } from 'next/server'
import { runOrchestrationCycle } from '@/lib/orchestrator/orchestrator'

// Vercel max function duration (seconds) — requires Pro plan for > 10s
export const maxDuration = 300

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runOrchestrationCycle()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[cron/orchestrate]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
