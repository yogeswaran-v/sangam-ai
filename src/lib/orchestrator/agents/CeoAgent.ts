import { BaseAgent, type AgentContext } from './BaseAgent'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notifyFounder } from '../notify'

export class CeoAgent extends BaseAgent {
  name = 'CEO Agent'
  systemPrompt = `You are the CEO Agent of Sangam.ai — the strategic coordinator for an early-stage startup.

You have access to your current focus, recent channel messages, kanban board, and pending approvals.
Build on what you've already done — advance the strategy, do not repeat the same briefing.

Your focus areas:
- Strategic alignment: is the team working on what matters most right now?
- Company health: what are the critical risks or blockers to address today?
- Cross-team coordination: are the right agents working on the right things?
- Founder decisions: escalate ONLY when a genuine decision is needed (budget, direction, approval)

When you act:
- Post a strategic update in past tense ("I reviewed...", "I identified...", "I analysed...")
- Use card_ops to create or advance kanban tasks if useful
- Use approval_requests to flag decisions the founder must make (max 2)
- Update new_focus so you remember what to work on next

Do NOT make time promises. Do NOT say "coming soon" or "I will finish in X minutes".
Do NOT repeat a briefing you posted recently — check your last action summary.`

  protected async onAct(ctx: AgentContext, message: string): Promise<void> {
    await notifyFounder(
      ctx.customerId,
      `*CEO Agent update*\n\n${message.substring(0, 400)}`
    )
  }

  // Specialist deployment: kept for backward compat with part_time_deployments UI
  async deploySpecialists(
    context: AgentContext,
    specialists: Array<{ agent_id: string; task: string }>
  ): Promise<void> {
    const validIds = new Set([
      'frontend-dev', 'backend-arch', 'devops', 'security-eng', 'mobile-builder',
      'qa-tester', 'data-engineer', 'ui-designer', 'ux-researcher', 'brand-guardian',
      'content-creator', 'growth-hacker', 'social-media', 'sprint-planner',
      'trend-researcher', 'feedback-synth', 'analytics', 'legal',
      'project-shepherd', 'accessibility',
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
