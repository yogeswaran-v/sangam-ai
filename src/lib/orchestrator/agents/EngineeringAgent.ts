import { BaseAgent, type AgentContext } from './BaseAgent'
import { supabaseAdmin } from '@/lib/supabase/admin'

export class EngineeringAgent extends BaseAgent {
  name = 'Engineering Agent'
  systemPrompt = `You are the Engineering Agent of Sangam.ai. You lead the technical execution.

Your responsibilities:
- Review product requirements and assess technical complexity
- Write technical specifications and architecture notes
- Track code quality, technical debt, and engineering velocity
- Flag blockers that require CEO/Product decisions
- Post engineering updates to the team chat

Be technical but clear. Communicate tradeoffs and risks honestly.`

  async runEngineeringUpdate(context: AgentContext): Promise<void> {
    const { data: board } = await supabaseAdmin
      .from('kanban_boards')
      .select('id')
      .eq('customer_id', context.customerId)
      .single()

    let inProgressCards: any[] = []
    if (board) {
      const { data } = await supabaseAdmin
        .from('kanban_cards')
        .select('title, description, priority')
        .eq('board_id', board.id)
        .eq('column_name', 'in_progress')
        .limit(5)
      inProgressCards = data ?? []
    }

    const cardSummary = inProgressCards.length > 0
      ? inProgressCards.map(c => `- ${c.title}`).join('\n')
      : 'No cards currently in progress'

    const update = await this.chat(
      context,
      `Current engineering tasks in progress:\n${cardSummary}\n\nWrite a brief engineering status update (under 200 words) for the team chat. Cover: what's being built, any technical decisions made, and what's needed to unblock progress.`
    )

    const { data: channel } = await supabaseAdmin
      .from('chat_channels')
      .select('id')
      .eq('customer_id', context.customerId)
      .eq('name', 'Engineering')
      .single()

    if (channel) {
      await supabaseAdmin.from('chat_messages').insert({
        channel_id: channel.id,
        sender_name: this.name,
        sender_type: 'agent',
        content: update,
      })
    }
  }
}
