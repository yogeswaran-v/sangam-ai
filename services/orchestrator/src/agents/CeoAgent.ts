import { BaseAgent, type AgentContext } from './BaseAgent'
import { supabase } from '../lib/supabase'
import { notifyCustomer } from '../lib/notify'

export class CeoAgent extends BaseAgent {
  name = 'CEO Agent'
  systemPrompt = `You are the CEO Agent of Sangam.ai. You are the strategic leader of the AI company.

Your responsibilities:
- Synthesise the founder's vision into actionable priorities
- Delegate tasks to specialist agents (Product, Engineering, Marketing, Sales, Finance)
- Make high-level decisions and send daily briefings to the founder
- Flag anything that requires human (CEO/founder) approval
- Keep the team aligned with the mission

Speak in first person as if you are the CEO. Be decisive, strategic, and motivating.`

  async runDailyBriefing(context: AgentContext): Promise<void> {
    const briefing = await this.chat(
      context,
      `Generate a concise daily briefing for the founder. Include:
1. What the team accomplished yesterday (if anything known)
2. Today's top 3 priorities across all departments
3. Any blockers or decisions needed from the founder
4. One motivational insight

Keep it under 300 words. Format for Telegram (use *bold* and bullet points).`
    )

    // Save to chat_channels
    const { data: channel } = await supabase
      .from('chat_channels')
      .select('id')
      .eq('customer_id', context.customerId)
      .eq('name', 'CEO Updates')
      .single()

    if (channel) {
      await supabase.from('chat_messages').insert({
        channel_id: channel.id,
        sender_name: this.name,
        sender_type: 'agent',
        content: briefing,
      })
    }

    // Notify via Telegram
    await notifyCustomer(context.customerId, `*Daily Briefing from CEO Agent*\n\n${briefing}`)
  }
}
