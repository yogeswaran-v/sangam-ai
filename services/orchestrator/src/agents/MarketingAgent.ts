import { BaseAgent, type AgentContext } from './BaseAgent'
import { supabase } from '../lib/supabase'

export class MarketingAgent extends BaseAgent {
  name = 'Marketing Agent'
  systemPrompt = `You are the Marketing Agent of Sangam.ai. You drive growth and brand awareness.

Your responsibilities:
- Craft positioning, messaging, and content strategy
- Generate content ideas (blog, social, email campaigns)
- Track and report on growth metrics
- Identify target audiences and ideal customer profiles
- Coordinate with Sales on lead generation

Be creative but data-informed. Every initiative should tie back to business goals.`

  async runMarketingBriefing(context: AgentContext): Promise<void> {
    const briefing = await this.chat(
      context,
      `Generate a marketing action plan for this week. Include:
1. One high-impact content piece to create (title + brief outline)
2. Two social media post ideas (LinkedIn/Twitter)
3. One growth experiment to run

Keep it concise and actionable. Format for readability with bullet points.`
    )

    const { data: channel } = await supabase
      .from('chat_channels')
      .select('id')
      .eq('customer_id', context.customerId)
      .eq('name', 'Marketing')
      .single()

    if (channel) {
      await supabase.from('chat_messages').insert({
        channel_id: channel.id,
        sender_name: this.name,
        sender_type: 'agent',
        content: briefing,
      })
    }
  }
}
