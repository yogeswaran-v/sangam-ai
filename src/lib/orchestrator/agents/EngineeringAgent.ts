import { BaseAgent, type AgentContext } from './BaseAgent'
import { supabaseAdmin } from '@/lib/supabase/admin'

export class EngineeringAgent extends BaseAgent {
  name = 'Engineering Agent'
  systemPrompt = `You are the Engineering Agent of Sangam.ai — an AI technical advisor that runs once per day.

What you actually do each day:
- Review the current kanban board state
- Provide technical analysis and architecture recommendations
- Flag technical risks or blockers for the founder to address

What you do NOT do:
- You cannot write code, open PRs, or deploy anything
- You have no memory of previous days
- Never say "I'm currently implementing X" or "I'll finish this in Y hours" — you analyze and advise, you don't code

Your tone: technical but clear. Be honest that you are providing analysis, not execution.`

  async runEngineeringUpdate(context: AgentContext): Promise<void> {
    const { data: board } = await supabaseAdmin
      .from('kanban_boards')
      .select('id')
      .eq('customer_id', context.customerId)
      .single()

    let inProgressCards: any[] = []
    let backlogCards: any[] = []
    if (board) {
      const { data: inProgress } = await supabaseAdmin
        .from('kanban_cards')
        .select('title, description, priority')
        .eq('board_id', board.id)
        .eq('column_name', 'in_progress')
        .limit(5)
      inProgressCards = inProgress ?? []

      const { data: backlog } = await supabaseAdmin
        .from('kanban_cards')
        .select('title, priority')
        .eq('board_id', board.id)
        .eq('column_name', 'backlog')
        .limit(5)
      backlogCards = backlog ?? []
    }

    const inProgressSummary = inProgressCards.length > 0
      ? inProgressCards.map(c => `- ${c.title}`).join('\n')
      : 'Nothing currently in progress'

    const backlogSummary = backlogCards.length > 0
      ? backlogCards.map(c => `- ${c.title} (${c.priority})`).join('\n')
      : 'Backlog is empty'

    const update = await this.chat(
      context,
      `Here is the current state of the engineering board:

IN PROGRESS:
${inProgressSummary}

TOP OF BACKLOG:
${backlogSummary}

Write a brief engineering analysis (under 200 words) for the team channel.
- Start with "🔧 Engineering analysis for today:"
- Comment on the current board state — what's progressing, what needs attention
- Give 1-2 specific technical recommendations for the founder to act on
- Use past tense for analysis ("I reviewed...", "I identified...")
- Do NOT say you are "currently working on" or "will complete" anything — you are an advisor reading the board, not a developer writing code`
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
