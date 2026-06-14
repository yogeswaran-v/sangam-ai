import { BaseAgent, type AgentContext } from './BaseAgent'
import { supabaseAdmin } from '@/lib/supabase/admin'

export class ProductAgent extends BaseAgent {
  name = 'Product Agent'
  systemPrompt = `You are the Product Agent of Sangam.ai — an AI product advisor that runs once per day.

What you actually do each day:
- Analyze the product vision and requirements
- Add specific, actionable tasks to the kanban backlog for the founder to action
- Flag critical product decisions that need founder input

What you do NOT do:
- You cannot build features, write code, or ship anything
- You have no memory of previous days
- Never say "I will implement X" or "coming soon" — you queue tasks, you don't execute them

Your tone: precise, product-focused. Report what you analyzed and what tasks you've queued today.`

  async runProductCycle(context: AgentContext): Promise<void> {
    const tasks = await this.chat(
      context,
      `Analyze the product vision and queue 3-5 specific tasks to the kanban backlog today.

Each task should be something the founder or a developer could actually execute.
Format as JSON array:
[{"title": "...", "description": "...", "priority": "medium", "column_name": "backlog", "assigned_agent": "Engineering Agent"}]

Rules:
- title: short, verb-first ("Build X", "Fix Y", "Research Z")
- description: what to do and why, 1-2 sentences
- priority: low/medium/high/critical
- Do NOT include vague tasks like "improve performance" — be specific
- Output ONLY valid JSON, no markdown`
    )

    let cards: any[] = []
    try {
      cards = JSON.parse(tasks)
    } catch {
      console.error('ProductAgent: Failed to parse task JSON')
      return
    }

    const { data: board } = await supabaseAdmin
      .from('kanban_boards')
      .select('id')
      .eq('customer_id', context.customerId)
      .single()

    if (!board || !Array.isArray(cards)) return

    for (const card of cards) {
      const { data: inserted } = await supabaseAdmin.from('kanban_cards').insert({
        board_id: board.id,
        title: card.title ?? 'Untitled task',
        description: card.description ?? null,
        priority: card.priority ?? 'medium',
        column_name: 'backlog',
        assigned_agent: card.assigned_agent ?? this.name,
      }).select('id').single()

      if (card.priority === 'critical' && inserted?.id) {
        await this.requestApproval(
          context,
          `Approve task: ${card.title ?? 'Untitled task'}`,
          `Product Agent flagged this as critical priority. ${card.description ?? ''} Approve to move it to active development.`,
          inserted.id
        )
      }
    }

    // Post a summary to the Product channel
    const { data: channel } = await supabaseAdmin
      .from('chat_channels')
      .select('id')
      .eq('customer_id', context.customerId)
      .eq('name', 'Product')
      .single()

    if (channel && cards.length > 0) {
      const summary = `📋 **Backlog updated** — I queued ${cards.length} task${cards.length > 1 ? 's' : ''} today:\n` +
        cards.map((c: any) => `• **${c.title}** (${c.priority ?? 'medium'})`).join('\n') +
        `\n\nThese are ready for you to pick up and action.`
      await supabaseAdmin.from('chat_messages').insert({
        channel_id: channel.id,
        sender_name: this.name,
        sender_type: 'agent',
        content: summary,
      })
    }
  }
}
