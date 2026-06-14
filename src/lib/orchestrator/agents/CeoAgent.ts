import { BaseAgent, type AgentContext } from './BaseAgent'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notifyFounder } from '../notify'

export class CeoAgent extends BaseAgent {
  name = 'CEO Agent'
  systemPrompt = `You are the CEO Agent of Sangam.ai. You are the strategic leader of the AI company.

Your responsibilities:
- Synthesise the founder's vision into actionable priorities
- Delegate tasks to specialist agents (Product, Engineering, Marketing, Sales, Finance)
- Make high-level decisions and send daily briefings to the founder
- Flag anything that requires human (CEO/founder) approval
- Keep the team aligned with the mission

Speak in first person as if you are the CEO. Be decisive, strategic, and motivating.`

  async runDailyBriefing(context: AgentContext): Promise<void> {
    // Single AI call for all CEO tasks — keeps execution under Vercel Hobby's 10s limit
    const raw = await this.chat(
      context,
      `Generate today's CEO operations. Return ONLY valid JSON with this exact shape:
{
  "briefing": "<daily briefing under 300 words, bullet points, for the founder>",
  "approvals": [{"title": "short title", "description": "1-2 sentence explanation"}],
  "specialists": [{"agent_id": "frontend-dev", "task": "specific task description"}]
}

Rules:
- briefing: cover today's top 3 priorities, any blockers, one motivational insight
- approvals: 0-2 items that genuinely need the founder's decision today
- specialists: 0-2 from this list only: frontend-dev, backend-arch, devops, security-eng, mobile-builder, qa-tester, data-engineer, ui-designer, ux-researcher, brand-guardian, content-creator, growth-hacker, social-media, sprint-planner, trend-researcher, feedback-synth, analytics, legal, project-shepherd, accessibility
- Output ONLY the JSON object. No markdown, no explanation.`
    )

    let parsed: { briefing: string; approvals: Array<{ title: string; description: string }>; specialists: Array<{ agent_id: string; task: string }> }
    try {
      parsed = JSON.parse(raw.trim())
    } catch {
      console.error('CeoAgent: Failed to parse combined JSON response')
      return
    }

    const briefing = parsed.briefing ?? ''
    const approvals = Array.isArray(parsed.approvals) ? parsed.approvals : []
    const specialists = Array.isArray(parsed.specialists) ? parsed.specialists : []

    // Post briefing to chat channel
    const { data: channel } = await supabaseAdmin
      .from('chat_channels')
      .select('id')
      .eq('customer_id', context.customerId)
      .eq('name', 'CEO Updates')
      .single()

    if (channel && briefing) {
      await supabaseAdmin.from('chat_messages').insert({
        channel_id: channel.id,
        sender_name: this.name,
        sender_type: 'agent',
        content: briefing,
      })
    }

    await notifyFounder(context.customerId, `*Daily Briefing from CEO Agent*\n\n${briefing}`)

    // Create approval requests
    for (const item of approvals.slice(0, 2)) {
      if (!item.title || !item.description) continue
      await this.requestApproval(context, item.title, item.description)
    }

    // Deploy specialists
    const validIds = new Set([
      'frontend-dev','backend-arch','devops','security-eng','mobile-builder','qa-tester',
      'data-engineer','ui-designer','ux-researcher','brand-guardian','content-creator',
      'growth-hacker','social-media','sprint-planner','trend-researcher','feedback-synth',
      'analytics','legal','project-shepherd','accessibility',
    ])

    for (const item of specialists.slice(0, 2)) {
      if (!item.agent_id || !validIds.has(item.agent_id)) continue
      await supabaseAdmin
        .from('part_time_deployments')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('customer_id', context.customerId)
        .eq('agent_id', item.agent_id)
        .eq('status', 'active')
      await supabaseAdmin.from('part_time_deployments').insert({
        customer_id: context.customerId,
        agent_id: item.agent_id,
        task_description: item.task,
        status: 'active',
      })
    }

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    await supabaseAdmin
      .from('part_time_deployments')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('customer_id', context.customerId)
      .eq('status', 'active')
      .lt('deployed_at', twoHoursAgo)
  }
}
