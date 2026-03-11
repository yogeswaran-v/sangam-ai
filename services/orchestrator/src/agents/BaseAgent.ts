import { anthropic } from '../lib/anthropic'
import { supabase } from '../lib/supabase'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'

export interface AgentContext {
  customerId: string
  vision: string
  productRequirements: string
  monetaryGoals: string
  timeline: string
}

// Demo environment hard cap — $2.00 total across all customers this month
const DEMO_SPEND_CAP_USD = 2.00

class SpendCapError extends Error {
  constructor(spent: number) {
    super(`Demo spend cap reached ($${spent.toFixed(4)} / $${DEMO_SPEND_CAP_USD}). Agents paused.`)
    this.name = 'SpendCapError'
  }
}

async function getMonthlySpend(): Promise<number> {
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('token_usage')
    .select('cost_usd')
    .gte('recorded_at', monthStart.toISOString())

  if (error) {
    console.error('Could not check spend cap:', error.message)
    return 0
  }

  return (data ?? []).reduce((sum, row) => sum + Number(row.cost_usd), 0)
}

function deriveEventType(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('kanban') || m.includes('backlog') || m.includes('task') || m.includes('sprint')) return 'kanban_update'
  if (m.includes('code') || m.includes('implement') || m.includes('feature') || m.includes('bug') || m.includes('deploy')) return 'code_review'
  if (m.includes('content') || m.includes('blog') || m.includes('seo') || m.includes('copy') || m.includes('campaign')) return 'content_creation'
  if (m.includes('brief') || m.includes('priorit') || m.includes('strateg') || m.includes('vision') || m.includes('okr')) return 'strategy_planning'
  if (m.includes('revenue') || m.includes('budget') || m.includes('forecast') || m.includes('p&l') || m.includes('finance') || m.includes('invoice')) return 'finance_review'
  if (m.includes('outreach') || m.includes('crm') || m.includes('prospect') || m.includes('pitch') || m.includes('sales')) return 'sales_outreach'
  if (m.includes('standup') || m.includes('meeting') || m.includes('discuss') || m.includes('collab') || m.includes('sync')) return 'team_sync'
  if (m.includes('market') || m.includes('growth') || m.includes('social') || m.includes('brand')) return 'marketing_work'
  if (m.includes('approval') || m.includes('decision') || m.includes('founder') || m.includes('review')) return 'approval_request'
  if (m.includes('infra') || m.includes('server') || m.includes('cloud') || m.includes('devops')) return 'infra_work'
  return 'agent_work'
}

export abstract class BaseAgent {
  abstract name: string
  abstract systemPrompt: string

  /**
   * Creates an approval request row that the founder sees in the Approvals dashboard.
   * Call this whenever an agent needs a human decision before proceeding.
   */
  protected async requestApproval(
    context: AgentContext,
    title: string,
    description: string,
    cardId?: string
  ): Promise<void> {
    await supabase.from('approval_requests').insert({
      customer_id: context.customerId,
      title,
      description,
      status: 'pending',
      card_id: cardId ?? null,
    })
  }

  protected async chat(
    context: AgentContext,
    userMessage: string,
    history: MessageParam[] = []
  ): Promise<string> {
    // Check demo spend cap before every API call
    const currentSpend = await getMonthlySpend()
    if (currentSpend >= DEMO_SPEND_CAP_USD) {
      throw new SpendCapError(currentSpend)
    }

    const messages: MessageParam[] = [
      ...history,
      { role: 'user', content: userMessage },
    ]

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: this.buildSystem(context),
      messages,
    })

    const content = response.content[0]
    const text = content.type === 'text' ? content.text : ''

    // Log token usage
    await supabase.from('token_usage').insert({
      customer_id: context.customerId,
      agent_name: this.name,
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
      cost_usd: this.estimateCost(response.usage.input_tokens, response.usage.output_tokens),
    })

    // Log agent event
    await supabase.from('agent_events').insert({
      customer_id: context.customerId,
      agent_name: this.name,
      event_type: deriveEventType(userMessage),
      payload: { response_length: text.length },
    })

    return text
  }

  private buildSystem(ctx: AgentContext): string {
    return `${this.systemPrompt}

## Current Mission Context
**Vision:** ${ctx.vision}
**Product:** ${ctx.productRequirements}
**Goals:** ${ctx.monetaryGoals}
**Timeline:** ${ctx.timeline}

Always be concise, actionable, and focused on moving the mission forward.`
  }

  private estimateCost(inputTokens: number, outputTokens: number): number {
    // claude-sonnet-4-6: $3/M input, $15/M output
    return (inputTokens * 3 + outputTokens * 15) / 1_000_000
  }
}
