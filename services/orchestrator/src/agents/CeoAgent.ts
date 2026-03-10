import { BaseAgent, type AgentContext } from './BaseAgent'
import { supabase } from '../lib/supabase'
import { notifyCustomer } from '../lib/notify'

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

Keep it under 300 words. Format for Telegram (use *bold* and bullet points).`
    )

    // Save to chat_channels
    const { data: channel } = await supabase
      .from('chat_channels')
      .select('id')
      .eq('customer_id', context.customerId)
      .eq('name', 'CEO Updates')
      .single()

    if (channel) {
      await supabase.from('chat_messages').insert({
        channel_id: channel.id,
        sender_name: this.name,
        sender_type: 'agent',
        content: briefing,
      })
    }

    // Notify via Telegram
    await notifyCustomer(context.customerId, `*Daily Briefing from CEO Agent*\n\n${briefing}`)

    // Ask Claude if any decisions need founder approval today
    await this.generateApprovalRequests(context)

    // Deploy specialist agents for today's priorities
    await this.deploySpecialists(context)
  }

  async deploySpecialists(context: AgentContext): Promise<void> {
    const raw = await this.chat(
      context,
      `Based on the current mission and today's priorities, which specialist agents (if any) should be deployed to help the team?

Available specialists:
- frontend-dev (Alex Chen): React/UI implementation
- backend-arch (Ravi Kumar): API design, databases
- devops (Sam Okafor): CI/CD, cloud infrastructure
- security-eng (Priya Nair): Security audits, OWASP
- mobile-builder (James Park): iOS/Android/React Native
- qa-tester (Lisa Zhang): Test plans, quality assurance
- data-engineer (Tatiana Volkov): Data pipelines, ETL
- ui-designer (Sofia Reyes): Figma, design systems
- ux-researcher (Maya Iyer): User testing, usability
- brand-guardian (Lena Müller): Brand identity, guidelines
- content-creator (Aisha Patel): Blog posts, SEO content
- growth-hacker (Carlos Mendez): User acquisition, A/B tests
- social-media (Yuki Tanaka): Instagram, LinkedIn, X
- sprint-planner (Arjun Sharma): Agile sprint planning
- trend-researcher (Nina Kovacs): Market research, competitive analysis
- feedback-synth (Omar Hassan): User feedback analysis
- analytics (Elena Vasquez): Data dashboards, BI reports
- legal (Deepa Krishnan): Compliance, contracts, GDPR
- project-shepherd (Marcus Johnson): Cross-functional coordination
- accessibility (Kwame Asante): WCAG, a11y audits

Select at most 2 specialists needed TODAY given the mission context. For each, provide a specific task.

Return JSON array: [{"agent_id": "frontend-dev", "task": "Build the landing page hero section"}]
If no specialists are needed today, return: []

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

      // Mark any existing active deployment for this agent as completed
      await supabase
        .from('part_time_deployments')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('customer_id', context.customerId)
        .eq('agent_id', item.agent_id)
        .eq('status', 'active')

      // Create new deployment
      await supabase.from('part_time_deployments').insert({
        customer_id: context.customerId,
        agent_id: item.agent_id,
        task_description: item.task,
        status: 'active',
      })
    }

    // Auto-complete deployments older than 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    await supabase
      .from('part_time_deployments')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('customer_id', context.customerId)
      .eq('status', 'active')
      .lt('deployed_at', twoHoursAgo)
  }

  private async generateApprovalRequests(context: AgentContext): Promise<void> {
    const raw = await this.chat(
      context,
      `Based on the current mission, what specific decisions require the founder's approval right now?

Think about: major product pivots, significant budget commitments, hiring decisions, key partnerships, launch go/no-go decisions, architectural choices with major tradeoffs.

Return a JSON array (max 2 items). Each item: {"title": "short decision title", "description": "1-2 sentence explanation of what the founder needs to decide and why it matters"}.

If nothing critical needs approval today, return an empty array: []

Output ONLY valid JSON. No markdown, no explanation.`
    )

    let items: Array<{ title: string; description: string }> = []
    try {
      const parsed = JSON.parse(raw.trim())
      if (Array.isArray(parsed)) items = parsed
    } catch {
      return // LLM didn't return valid JSON — skip silently
    }

    for (const item of items.slice(0, 2)) {
      if (!item.title || !item.description) continue
      await this.requestApproval(context, item.title, item.description)
    }
  }
}
