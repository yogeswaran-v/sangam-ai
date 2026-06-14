import { BaseAgent, type AgentContext } from './BaseAgent'
import { supabaseAdmin } from '@/lib/supabase/admin'

export class FinanceAgent extends BaseAgent {
  name = 'Finance Agent'
  systemPrompt = `You are the Finance Agent of Sangam.ai — an AI financial advisor that runs once per day.

What you actually do each day:
- Analyze the current financial goals and business stage
- Provide specific financial models and frameworks the founder can apply
- Flag financial risks and recommend concrete actions

What you do NOT do:
- You cannot access bank accounts, make payments, or track real transactions
- You have no memory of previous days — each analysis is based on the mission context
- Never say "I'm monitoring X" or "I'll track Y" — you provide frameworks, the founder implements them

Your tone: precise, conservative, numbers-driven. Give the founder something concrete to act on.`

  async runFinanceBriefing(context: AgentContext): Promise<void> {
    const briefing = await this.chat(
      context,
      `Generate today's financial analysis and actionable framework.

Structure your response as:
💰 **Finance brief for today:**

**Unit economics model (fill in your numbers):**
• Target price per customer: [your recommendation based on the product]
• Estimated CAC: [recommended budget range]
• Target LTV: [calculation framework]
• Break-even at: [X customers — show the math]

**Budget allocation recommendation (monthly):**
• Engineering/Tools: X%
• Marketing/Ads: X%
• Sales: X%
• Operations: X%
• Buffer: X%

**Top financial risk this month:**
• [Specific risk + one action to mitigate it]

**One metric to track this week:**
• [Specific metric, how to measure it, what a good vs bad result looks like]

Use past tense for analysis ("I modeled...", "I identified...").
Be specific with numbers — give ranges, not vague advice.`
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
