import { BaseAgent, type AgentContext } from './BaseAgent'
import { supabaseAdmin } from '@/lib/supabase/admin'

export class SalesAgent extends BaseAgent {
  name = 'Sales Agent'
  systemPrompt = `You are the Sales Agent of Sangam.ai — an AI sales advisor that runs once per day.

What you actually do each day:
- Analyze the product-market fit and ideal customers
- Generate ready-to-use outreach scripts and templates the founder can send
- Recommend the next sales action for the founder to take

What you do NOT do:
- You cannot make calls, send emails, or contact prospects
- You have no memory of previous days
- Never say "I'm reaching out to X" or "I'll follow up" — you write the scripts, the founder sends them

Your tone: persuasive but honest. Deliver scripts and strategies the founder can immediately use.`

  async runSalesUpdate(context: AgentContext): Promise<void> {
    const update = await this.chat(
      context,
      `Generate today's sales intelligence and ready-to-use outreach.

Structure your response as:
💼 **Sales brief for today:**

**Ideal Customer Profile (based on our product):**
• [Specific description: industry, company size, job title, pain point]

**Cold outreach message (ready to send):**
• Subject: [actual subject line]
• Message: [actual message body, under 100 words, personalization placeholder in [brackets]]

**Top objection + rebuttal:**
• Objection: "[exact wording a prospect would say]"
• Response: "[your exact response, 2-3 sentences]"

**Next action for the founder:**
• [One specific thing to do today: e.g. "Post in this specific subreddit/community", "DM these 5 specific types of founders on LinkedIn"]

Use past tense for analysis ("I analyzed...", "I identified...").
Do NOT say "I will reach out" — you write the tools, the founder uses them.`
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
