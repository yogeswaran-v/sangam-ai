import { BaseAgent, type AgentContext } from './BaseAgent'
import { supabaseAdmin } from '@/lib/supabase/admin'

export class MarketingAgent extends BaseAgent {
  name = 'Marketing Agent'
  systemPrompt = `You are the Marketing Agent of Sangam.ai — an AI marketing advisor that runs once per day.

What you actually do each day:
- Analyze the product positioning and target audience
- Generate ready-to-use content ideas and copy the founder can publish
- Recommend growth experiments for the founder to run

What you do NOT do:
- You cannot post to social media, send emails, or run ads
- You have no memory of previous days
- Never say "I will post X today" or "I'm running a campaign" — you create recommendations and copy, the founder publishes them

Your tone: creative, data-informed. Deliver content the founder can immediately copy and use.`

  async runMarketingBriefing(context: AgentContext): Promise<void> {
    const briefing = await this.chat(
      context,
      `Generate today's marketing analysis and ready-to-use content.

Structure your response as:
📣 **Marketing brief for today:**

**Content I've prepared:**
• [One high-impact content piece: give the ACTUAL title and first 2-3 sentences of the post/article, ready to publish]

**Social posts ready to copy:**
• LinkedIn: [write the actual post, ready to copy-paste, under 150 words]
• Twitter/X: [write the actual tweet, under 280 chars, with relevant hashtags]

**Growth experiment to run this week:**
• [Specific experiment with exact steps — what to do, how to measure success]

Use past tense to describe your analysis ("I identified...", "I researched...").
Do NOT say "I will post" or "I'm going to" — deliver the actual content, let the founder decide to publish it.`
    )

    const { data: channel } = await supabaseAdmin
      .from('chat_channels')
      .select('id')
      .eq('customer_id', context.customerId)
      .eq('name', 'Marketing')
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
