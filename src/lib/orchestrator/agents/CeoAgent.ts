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
    const briefing = await this.chat(
      context,
      `Generate a concise daily briefing for the founder. Include:
1. What the team accomplished yesterday (if anything known)
2. Today's top 3 priorities across all departments
3. Any blockers or decisions needed from the founder
4. One motivational insight

Keep it under 300 words. Format with bullet points.`
    )

    const { data: channel } = await supabaseAdmin
      .from('chat_channels')
      .select('id')
      .eq('customer_id', context.customerId)
      .eq('name', 'CEO Updates')
      .single()

    if (channel) {
      await supabaseAdmin.from('chat_messages').insert({
        channel_id: channel.id,
        sender_name: this.name,
        sender_type: 'agent',
        content: briefing,
      })
    }

    await notifyFounder(context.customerId, `*Daily Briefing from CEO Agent*\n\n${briefing}`)
    await this.generateApprovalRequests(context, briefing)
    await this.deploySpecialists(context)
  }

  async deploySpecialists(context: AgentContext): Promise<void> {
    const raw = await this.chat(
      context,
      `Based on the current mission and today's priorities, which specialist agents (if any) should be deployed?

Available specialists:
- frontend-dev, backend-arch, devops, security-eng, mobile-builder, qa-tester,
  data-engineer, ui-designer, ux-researcher, brand-guardian, content-creator,
  growth-hacker, social-media, sprint-planner, trend-researcher, feedback-synth,
  analytics, legal, project-shepherd, accessibility

Select at most 2 specialists needed TODAY. For each, provide a specific task.
Return JSON array: [{"agent_id": "frontend-dev", "task": "Build the landing page hero section"}]
If no specialists needed today, return: []
Output ONLY valid JSON. No markdown.`
    )

    let items: Array<{ agent_id: string; task: string }> = []
    try {
      const parsed = JSON.parse(raw.trim())
      if (Array.isArray(parsed)) items = parsed
    } catch {
      return
    }

    const validIds = new Set([
      'frontend-dev','backend-arch','devops','security-eng','mobile-builder','qa-tester',
      'data-engineer','ui-designer','ux-researcher','brand-guardian','content-creator',
      'growth-hacker','social-media','sprint-planner','trend-researcher','feedback-synth',
      'analytics','legal','project-shepherd','accessibility',
    ])

    for (const item of items.slice(0, 2)) {
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

  private async generateApprovalRequests(context: AgentContext, briefingContent: string): Promise<void> {
    const raw = await this.chat(
      context,
      `You just sent this daily briefing to the founder:

"${briefingContent}"

Based on this briefing and the current mission, identify 1-2 specific decisions that require the founder's approval TODAY.

Return JSON array: [{"title": "short decision title", "description": "1-2 sentence explanation"}]
If nothing needs approval, return: []
Output ONLY valid JSON.`
    )

    let items: Array<{ title: string; description: string }> = []
    try {
      const parsed = JSON.parse(raw.trim())
      if (Array.isArray(parsed)) items = parsed
    } catch {
      return
    }

    for (const item of items.slice(0, 2)) {
      if (!item.title || !item.description) continue
      await this.requestApproval(context, item.title, item.description)
    }
  }
}
