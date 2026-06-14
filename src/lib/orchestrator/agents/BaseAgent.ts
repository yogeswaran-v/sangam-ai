import Anthropic from '@anthropic-ai/sdk'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { AgentState, AgentAction, CardOp } from '../types'
import { buildWorldState } from '../memory'

// Re-export AgentContext so existing callers (orchestrator.ts etc.) keep working
export type { AgentContext } from '../types'
import type { AgentContext } from '../types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const SPEND_CAP_USD = 5.00

const CHANNEL_MAP: Record<string, string> = {
  'CEO Agent': 'CEO Updates',
  'Engineering Agent': 'Engineering',
  'Product Agent': 'Product',
  'Marketing Agent': 'Marketing',
  'Sales Agent': 'Sales',
  'Finance Agent': 'Finance',
}

const DECIDE_TOOL: Anthropic.Tool = {
  name: 'decide_action',
  description: 'Decide your next action. Pick exactly one action_type and fill in the relevant fields.',
  input_schema: {
    type: 'object' as const,
    properties: {
      action_type: {
        type: 'string',
        enum: ['act', 'handoff', 'escalate', 'idle'],
        description: 'act=post message + optional kanban ops; handoff=assign work to another agent; escalate=ask founder for a decision; idle=nothing to do right now',
      },
      // act
      message: { type: 'string', description: 'Required for act. What to post to your channel (concrete, past-tense analysis + recommendations, max 350 words).' },
      card_ops: {
        type: 'array',
        description: 'Optional with act. Kanban card operations.',
        items: {
          type: 'object',
          properties: {
            op: { type: 'string', enum: ['create', 'move', 'comment'] },
            card_id: { type: 'string', description: 'Required for move/comment' },
            to_column: { type: 'string', enum: ['backlog', 'in_progress', 'review', 'pending_approval', 'done'] },
            title: { type: 'string' },
            description: { type: 'string' },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            assigned_agent: { type: 'string', description: 'e.g. "Engineering Agent"' },
          },
          required: ['op'],
        },
      },
      approval_requests: {
        type: 'array',
        description: 'Optional with act. Create approval requests alongside your message.',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            question: { type: 'string' },
            category: { type: 'string', enum: ['direction', 'approval', 'budget'] },
          },
          required: ['title', 'question', 'category'],
        },
      },
      new_focus: { type: 'string', description: 'Optional. Update your remembered focus for the next run.' },
      // handoff
      to_agent: { type: 'string', description: 'Required for handoff. e.g. "Engineering Agent"' },
      task_title: { type: 'string', description: 'Required for handoff. Short, verb-first title.' },
      task_description: { type: 'string', description: 'Required for handoff. What to do and why.' },
      priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
      handoff_message: { type: 'string', description: 'Optional for handoff. Message to post explaining the handoff.' },
      // escalate
      escalate_title: { type: 'string', description: 'Required for escalate. Short title for the decision.' },
      question: { type: 'string', description: 'Required for escalate. The question for the founder.' },
      category: { type: 'string', enum: ['direction', 'approval', 'budget'], description: 'Required for escalate.' },
      escalate_card_id: { type: 'string', description: 'Optional for escalate. Linked kanban card ID.' },
      // idle
      reason: { type: 'string', description: 'Required for idle. Why no action is needed.' },
    },
    required: ['action_type'],
  },
}

async function getMonthlySpend(customerId: string): Promise<number> {
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const { data } = await supabaseAdmin
    .from('token_usage')
    .select('cost_usd')
    .eq('customer_id', customerId)
    .gte('recorded_at', monthStart.toISOString())

  return (data ?? []).reduce((sum, row) => sum + Number(row.cost_usd), 0)
}

function deriveEventType(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('kanban') || m.includes('backlog') || m.includes('task') || m.includes('sprint')) return 'kanban_update'
  if (m.includes('code') || m.includes('implement') || m.includes('feature') || m.includes('bug') || m.includes('deploy')) return 'code_review'
  if (m.includes('content') || m.includes('blog') || m.includes('seo') || m.includes('copy') || m.includes('campaign')) return 'content_creation'
  if (m.includes('brief') || m.includes('priorit') || m.includes('strateg') || m.includes('vision') || m.includes('okr')) return 'strategy_planning'
  if (m.includes('revenue') || m.includes('budget') || m.includes('forecast') || m.includes('finance') || m.includes('invoice')) return 'finance_review'
  if (m.includes('outreach') || m.includes('crm') || m.includes('prospect') || m.includes('pitch') || m.includes('sales')) return 'sales_outreach'
  if (m.includes('market') || m.includes('growth') || m.includes('social') || m.includes('brand')) return 'marketing_work'
  if (m.includes('approval') || m.includes('decision') || m.includes('founder') || m.includes('review')) return 'approval_request'
  if (m.includes('infra') || m.includes('server') || m.includes('cloud') || m.includes('devops')) return 'infra_work'
  return 'agent_work'
}

export abstract class BaseAgent {
  abstract name: string
  abstract systemPrompt: string

  protected get channelName(): string {
    return CHANNEL_MAP[this.name] ?? this.name
  }

  // Override in subclasses to trigger notifications after an act
  protected async onAct(_ctx: AgentContext, _message: string): Promise<void> {}

  private async loadOrSeedState(customerId: string): Promise<AgentState> {
    const { data: existing } = await supabaseAdmin
      .from('agent_state')
      .select('*')
      .eq('customer_id', customerId)
      .eq('agent_name', this.name)
      .single()

    if (existing) return existing as AgentState

    const { data: created } = await supabaseAdmin
      .from('agent_state')
      .insert({ customer_id: customerId, agent_name: this.name })
      .select('*')
      .single()

    return created as AgentState
  }

  private estimateCost(input: number, output: number): number {
    return (input * 0.25 + output * 1.25) / 1_000_000
  }

  private async recordUsage(customerId: string, input: number, output: number, eventType: string): Promise<void> {
    await supabaseAdmin.from('token_usage').insert({
      customer_id: customerId,
      agent_name: this.name,
      input_tokens: input,
      output_tokens: output,
      cost_usd: this.estimateCost(input, output),
    })
    await supabaseAdmin.from('agent_events').insert({
      customer_id: customerId,
      agent_name: this.name,
      event_type: eventType,
      payload: {},
    })
  }

  private buildSystemPrompt(ctx: AgentContext): string {
    return `${this.systemPrompt}

## Mission Context
**Vision:** ${ctx.vision}
**Product:** ${ctx.productRequirements}
**Goals:** ${ctx.monetaryGoals}
**Timeline:** ${ctx.timeline}`
  }

  private async getChannelId(customerId: string): Promise<string | null> {
    const { data } = await supabaseAdmin
      .from('chat_channels')
      .select('id')
      .eq('customer_id', customerId)
      .eq('name', this.channelName)
      .single()
    return data?.id ?? null
  }

  private async getBoardId(customerId: string): Promise<string | null> {
    const { data } = await supabaseAdmin
      .from('kanban_boards')
      .select('id')
      .eq('customer_id', customerId)
      .single()
    return data?.id ?? null
  }

  private async applyCardOps(customerId: string, ops: CardOp[]): Promise<void> {
    const boardId = await this.getBoardId(customerId)
    if (!boardId) return

    for (const op of ops) {
      if (op.op === 'create') {
        await supabaseAdmin.from('kanban_cards').insert({
          board_id: boardId,
          title: op.title ?? 'Untitled',
          description: op.description ?? null,
          priority: op.priority ?? 'medium',
          column_name: op.to_column ?? 'backlog',
          assigned_agent: op.assigned_agent ?? this.name,
          source_agent: this.name,
        })
      } else if (op.op === 'move' && op.card_id && op.to_column) {
        await supabaseAdmin
          .from('kanban_cards')
          .update({ column_name: op.to_column })
          .eq('id', op.card_id)
          .eq('board_id', boardId)
      } else if (op.op === 'comment' && op.card_id && op.description) {
        await supabaseAdmin.from('agent_events').insert({
          customer_id: customerId,
          agent_name: this.name,
          event_type: 'kanban_update',
          payload: { card_id: op.card_id, comment: op.description },
        })
      }
    }
  }

  protected async requestApproval(
    context: AgentContext,
    title: string,
    description: string,
    cardId?: string
  ): Promise<void> {
    await supabaseAdmin.from('approval_requests').insert({
      customer_id: context.customerId,
      title,
      description,
      status: 'pending',
      card_id: cardId ?? null,
    })
  }

  // Used by old run*() methods that still exist on subclasses for reference.
  // tick() is the preferred entry point.
  protected async chat(
    context: AgentContext,
    userMessage: string,
    history: MessageParam[] = []
  ): Promise<string> {
    const spent = await getMonthlySpend(context.customerId)
    if (spent >= SPEND_CAP_USD) {
      const err = new Error(`SpendCapError: $${spent.toFixed(4)} / $${SPEND_CAP_USD}`) as Error & { name: string }
      err.name = 'SpendCapError'
      throw err
    }

    const messages: MessageParam[] = [...history, { role: 'user', content: userMessage }]
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: this.buildSystemPrompt(context),
      messages,
    })

    const content = response.content[0]
    const text = content.type === 'text' ? content.text : ''

    await this.recordUsage(
      context.customerId,
      response.usage.input_tokens,
      response.usage.output_tokens,
      deriveEventType(userMessage)
    )

    return text
  }

  protected async decide(ctx: AgentContext, worldState: string): Promise<AgentAction> {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: this.buildSystemPrompt(ctx),
      tools: [DECIDE_TOOL],
      tool_choice: { type: 'tool', name: 'decide_action' },
      messages: [{
        role: 'user',
        content: `${worldState}\n\nReview your state above. Use decide_action to choose your next action.`,
      }],
    })

    await this.recordUsage(
      ctx.customerId,
      response.usage.input_tokens,
      response.usage.output_tokens,
      'agent_work'
    )

    const toolUse = response.content.find((c) => c.type === 'tool_use')
    if (!toolUse || toolUse.type !== 'tool_use') {
      return { type: 'idle', reason: 'No tool_use in response' }
    }

    const i = toolUse.input as Record<string, unknown>
    const at = String(i.action_type ?? 'idle')

    if (at === 'act') {
      return {
        type: 'act',
        message: String(i.message ?? ''),
        card_ops: (i.card_ops as CardOp[] | undefined) ?? [],
        approval_requests: (i.approval_requests as Array<{ title: string; question: string; category: 'direction' | 'approval' | 'budget' }> | undefined) ?? [],
        new_focus: i.new_focus ? String(i.new_focus) : undefined,
      }
    }
    if (at === 'handoff') {
      return {
        type: 'handoff',
        to_agent: String(i.to_agent ?? ''),
        task_title: String(i.task_title ?? ''),
        task_description: String(i.task_description ?? ''),
        priority: (i.priority as 'low' | 'medium' | 'high' | 'critical' | undefined) ?? 'medium',
        message: i.handoff_message ? String(i.handoff_message) : undefined,
      }
    }
    if (at === 'escalate') {
      return {
        type: 'escalate',
        title: String(i.escalate_title ?? i.title ?? ''),
        question: String(i.question ?? ''),
        card_id: i.escalate_card_id ? String(i.escalate_card_id) : undefined,
        category: (i.category as 'direction' | 'approval' | 'budget') ?? 'direction',
      }
    }

    return { type: 'idle', reason: String(i.reason ?? 'No reason given') }
  }

  protected async applyAction(
    ctx: AgentContext,
    action: AgentAction,
    state: AgentState
  ): Promise<void> {
    const now = new Date().toISOString()
    const stateUpdate: Record<string, unknown> = { last_action_at: now, updated_at: now }
    const channelId = await this.getChannelId(ctx.customerId)

    if (action.type === 'act') {
      if (channelId && action.message) {
        await supabaseAdmin.from('chat_messages').insert({
          channel_id: channelId,
          sender_name: this.name,
          sender_type: 'agent',
          content: action.message,
        })
        await this.onAct(ctx, action.message)
      }

      if (action.card_ops?.length) {
        await this.applyCardOps(ctx.customerId, action.card_ops)
      }

      for (const req of action.approval_requests ?? []) {
        if (!req.title || !req.question) continue
        await supabaseAdmin.from('approval_requests').insert({
          customer_id: ctx.customerId,
          title: req.title,
          description: req.question,
          status: 'pending',
        })
      }

      if (action.new_focus) stateUpdate.current_focus = action.new_focus
      // Clear waiting state once agent acts on an approval outcome
      if (state.waiting_on_approval_id) stateUpdate.waiting_on_approval_id = null
      stateUpdate.last_event_summary = `act: ${action.message.substring(0, 120)}`
    }

    if (action.type === 'handoff') {
      const boardId = await this.getBoardId(ctx.customerId)
      if (boardId) {
        await supabaseAdmin.from('kanban_cards').insert({
          board_id: boardId,
          title: action.task_title,
          description: action.task_description,
          priority: action.priority ?? 'medium',
          column_name: 'backlog',
          assigned_agent: action.to_agent,
          source_agent: this.name,
        })
      }
      if (channelId && action.message) {
        await supabaseAdmin.from('chat_messages').insert({
          channel_id: channelId,
          sender_name: this.name,
          sender_type: 'agent',
          content: action.message,
        })
      }
      stateUpdate.last_event_summary = `handoff to ${action.to_agent}: ${action.task_title}`
    }

    if (action.type === 'escalate') {
      const { data: approval } = await supabaseAdmin
        .from('approval_requests')
        .insert({
          customer_id: ctx.customerId,
          title: action.title,
          description: action.question,
          status: 'pending',
          card_id: action.card_id ?? null,
        })
        .select('id')
        .single()

      if (approval?.id) stateUpdate.waiting_on_approval_id = approval.id

      if (channelId) {
        await supabaseAdmin.from('chat_messages').insert({
          channel_id: channelId,
          sender_name: this.name,
          sender_type: 'agent',
          content: `❓ **Needs your decision:** ${action.title}\n\n${action.question}`,
        })
      }
      stateUpdate.last_event_summary = `escalated: ${action.title}`
    }

    if (action.type === 'idle') {
      stateUpdate.last_event_summary = `idle: ${action.reason}`
    }

    await supabaseAdmin
      .from('agent_state')
      .update(stateUpdate)
      .eq('id', state.id)
  }

  async tick(ctx: AgentContext): Promise<void> {
    const spent = await getMonthlySpend(ctx.customerId)
    if (spent >= SPEND_CAP_USD) {
      console.log(`[${this.name}] Budget paused for ${ctx.customerId} ($${spent.toFixed(2)} / $${SPEND_CAP_USD})`)
      return
    }

    const state = await this.loadOrSeedState(ctx.customerId)
    const worldState = await buildWorldState(ctx, this.name, this.channelName, state)
    const action = await this.decide(ctx, worldState)
    console.log(`[${this.name}] ${ctx.customerId} → ${action.type}`)
    await this.applyAction(ctx, action, state)
  }
}
