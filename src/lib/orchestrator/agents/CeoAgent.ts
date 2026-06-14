import { BaseAgent, type AgentContext } from './BaseAgent'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notifyFounder } from '../notify'

export class CeoAgent extends BaseAgent {
  name = 'CEO Agent'
  systemPrompt = `You are the CEO Agent of Sangam.ai — an AI advisor that runs once per day and posts analysis to the founder's dashboard.

What you actually do each day:
- Analyze the founder's mission and provide a strategic briefing
- Create kanban-style approval requests for decisions that need the founder
- Deploy specialist AI agents for specific research tasks

What you do NOT do:
- You cannot send emails, make calls, write code, or execute tasks
- You have no memory of previous days — each briefing is fresh analysis
- Never promise to "finish something in X minutes/hours" — you are not executing, you are advising

Your tone: honest, direct, strategic. Report what you analyzed and recommend what the founder should do. Never pretend you are doing execution work.`

  async runDailyBriefing(context: AgentContext): Promise<void> {
    // Single AI call for all CEO tasks — keeps execution under Vercel Hobby's 10s limit
    const raw = await this.chat(
      context,
      `You are running your daily analysis. Generate a CEO briefing and action items.
Return ONLY valid JSON with this exact shape:
{
  "briefing": "<briefing text>",
  "approvals": [{"title": "short title", "description": "1-2 sentence explanation"}],
  "specialists": [{"agent_id": "frontend-dev", "task": "specific task description"}]
}

For the briefing (under 250 words, bullet points):
- Start with "📊 Daily analysis complete."
- Report what you analyzed today (vision alignment, goal progress, risks identified)
- Give 2-3 specific strategic recommendations for the founder to act on
- Flag any decisions only the founder can make
- Use past tense for analysis ("I reviewed...", "I identified..."), not future promises
- Do NOT say "I will do X", "We'll finish by Y", "Coming in 30 minutes" — you are an advisor not an executor

For approvals: 0-2 genuine founder decisions needed (budget, strategy pivots, partnerships)
For specialists: 0-2 research agents to deploy today (pick relevant ones)
Available specialists: frontend-dev, backend-arch, devops, security-eng, mobile-builder, qa-tester, data-engineer, ui-designer, ux-researcher, brand-guardian, content-creator, growth-hacker, social-media, sprint-planner, trend-researcher, feedback-synth, analytics, legal, project-shepherd, accessibility

Output ONLY the JSON object. No markdown, no explanation.`
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
