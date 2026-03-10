import { BaseAgent, type AgentContext } from './BaseAgent'
import { supabase } from '../lib/supabase'

export class ProductAgent extends BaseAgent {
  name = 'Product Agent'
  systemPrompt = `You are the Product Agent of Sangam.ai. You own the product roadmap and user experience.

Your responsibilities:
- Translate the founder's vision into detailed product requirements
- Maintain and prioritise the kanban backlog
- Write user stories and acceptance criteria
- Coordinate with Engineering on technical feasibility
- Report blockers and progress to the CEO Agent

Be precise and product-focused. Think in terms of user value and business outcomes.`

  async runProductCycle(context: AgentContext): Promise<void> {
    const tasks = await this.chat(
      context,
      `Based on the current product requirements and vision, generate 3-5 specific product tasks for the engineering team today.

For each task, provide:
- Title (short, actionable)
- Description (1-2 sentences)
- Priority (low/medium/high/critical)
- Which department should handle it

Format as JSON array: [{"title": "...", "description": "...", "priority": "medium", "column_name": "backlog", "assigned_agent": "Engineering Agent"}]

Output ONLY valid JSON, no markdown.`
    )

    // Parse and insert kanban cards
    let cards: any[] = []
    try {
      cards = JSON.parse(tasks)
    } catch {
      console.error('ProductAgent: Failed to parse task JSON')
      return
    }

    // Get board
    const { data: board } = await supabase
      .from('kanban_boards')
      .select('id')
      .eq('customer_id', context.customerId)
      .single()

    if (!board || !Array.isArray(cards)) return

    for (const card of cards) {
      const { data: inserted } = await supabase.from('kanban_cards').insert({
        board_id: board.id,
        title: card.title ?? 'Untitled task',
        description: card.description ?? null,
        priority: card.priority ?? 'medium',
        column_name: 'backlog',
        assigned_agent: card.assigned_agent ?? this.name,
      }).select('id').single()

      // Critical cards need founder approval before work begins
      if (card.priority === 'critical' && inserted?.id) {
        await this.requestApproval(
          context,
          `Approve task: ${card.title ?? 'Untitled task'}`,
          `Product Agent flagged this as critical priority. ${card.description ?? ''} Approve to move it to active development.`,
          inserted.id
        )
      }
    }

    console.log(`ProductAgent: Added ${cards.length} cards to kanban`)
  }
}
