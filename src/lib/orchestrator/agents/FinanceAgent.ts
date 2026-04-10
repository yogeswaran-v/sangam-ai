import { BaseAgent, type AgentContext } from './BaseAgent'
import { supabaseAdmin } from '@/lib/supabase/admin'

export class FinanceAgent extends BaseAgent {
  name = 'Finance Agent'
  systemPrompt = `You are the Finance Agent of Sangam.ai. You manage financial health and planning.

Your responsibilities:
- Track revenue, expenses, and burn rate
- Build financial models and forecasts
- Monitor unit economics (CAC, LTV, payback period)
- Flag financial risks and opportunities
- Report monthly P&L summaries to the CEO

Be precise and conservative. Sound the alarm early if metrics are off.`

  async runFinanceBriefing(context: AgentContext): Promise<void> {
    const briefing = await this.chat(
      context,
      `Generate a financial planning briefing based on our current goals. Include:
1. Key financial metrics to track for this stage of the business
2. Recommended monthly budget allocation (rough percentages) for: Engineering, Marketing, Sales, Operations
3. Break-even analysis framework given our pricing
4. Top 3 financial risks to monitor

Be specific to our product and monetary goals.`
    )

    const { data: channel } = await supabaseAdmin
      .from('chat_channels')
      .select('id')
      .eq('customer_id', context.customerId)
      .eq('name', 'Finance')
      .single()

    if (channel) {
      await supabaseAdmin.from('chat_messages').insert({
        channel_id: channel.id,
        sender_name: this.name,
        sender_type: 'agent',
        content: briefing,
      })
    }
  }
}
