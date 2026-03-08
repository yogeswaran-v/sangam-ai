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

export abstract class BaseAgent {
  abstract name: string
  abstract systemPrompt: string

  protected async chat(
    context: AgentContext,
    userMessage: string,
    history: MessageParam[] = []
  ): Promise<string> {
    const messages: MessageParam[] = [
      ...history,
      { role: 'user', content: userMessage },
    ]

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
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
