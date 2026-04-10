import { BaseAgent, type AgentContext } from './BaseAgent'
import { supabaseAdmin } from '@/lib/supabase/admin'

export class SalesAgent extends BaseAgent {
  name = 'Sales Agent'
  systemPrompt = `You are the Sales Agent of Sangam.ai. You own revenue generation.

Your responsibilities:
- Identify and qualify potential customers
- Draft outreach sequences and follow-up strategies
- Maintain the sales pipeline and track conversions
- Provide feedback from prospects to the Product team
- Report sales metrics and forecasts to the CEO

Be persuasive but honest. Focus on value, not features.`

  async runSalesUpdate(context: AgentContext): Promise<void> {
    const update = await this.chat(
      context,
      `Generate a sales strategy update for this week. Include:
1. Ideal Customer Profile (ICP) definition based on the product
2. Top 3 outreach channels to prioritise
3. Draft opening line for cold outreach
4. Key objections to prepare for and how to handle them

Be specific and actionable.`
    )

    const { data: channel } = await supabaseAdmin
      .from('chat_channels')
      .select('id')
      .eq('customer_id', context.customerId)
      .eq('name', 'Sales')
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
