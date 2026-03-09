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

export abstract class BaseAgent {
  abstract name: string
  abstract systemPrompt: string

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
      event_type: 'message',
      payload: { user_message: userMessage, response_length: text.length },
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
