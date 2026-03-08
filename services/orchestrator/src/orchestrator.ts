import 'dotenv/config'
import { supabase } from './lib/supabase'
import { CeoAgent } from './agents/CeoAgent'
import { ProductAgent } from './agents/ProductAgent'
import { EngineeringAgent } from './agents/EngineeringAgent'
import { MarketingAgent } from './agents/MarketingAgent'
import { SalesAgent } from './agents/SalesAgent'
import { FinanceAgent } from './agents/FinanceAgent'
import type { AgentContext } from './agents/BaseAgent'

const ceoAgent = new CeoAgent()
const productAgent = new ProductAgent()
const engineeringAgent = new EngineeringAgent()
const marketingAgent = new MarketingAgent()
const salesAgent = new SalesAgent()
const financeAgent = new FinanceAgent()

async function getActiveCustomers(): Promise<AgentContext[]> {
  const { data: teams, error } = await supabase
    .from('agent_teams')
    .select(`
      customer_id,
      customers!inner(id, user_id),
      mission_control!inner(vision, product_requirements, monetary_goals, timeline)
    `)
    .eq('status', 'active')
    .eq('onboarding_complete', true)

  if (error || !teams) {
    console.error('Error fetching customers:', error)
    return []
  }

  return teams.map((team: any) => ({
    customerId: team.customer_id,
    vision: team.mission_control?.vision ?? '',
    productRequirements: team.mission_control?.product_requirements ?? '',
    monetaryGoals: team.mission_control?.monetary_goals ?? '',
    timeline: team.mission_control?.timeline ?? '',
  }))
}

async function ensureChatChannels(customerId: string): Promise<void> {
  const CHANNELS = [
    { name: 'CEO Updates', department: 'leadership' },
    { name: 'Engineering', department: 'engineering' },
    { name: 'Product', department: 'product' },
    { name: 'Marketing', department: 'marketing' },
    { name: 'Sales', department: 'sales' },
    { name: 'Finance', department: 'finance' },
  ]

  for (const ch of CHANNELS) {
    const { data: existing } = await supabase
      .from('chat_channels')
      .select('id')
      .eq('customer_id', customerId)
      .eq('name', ch.name)
      .single()

    if (!existing) {
      await supabase.from('chat_channels').insert({
        customer_id: customerId,
        name: ch.name,
        department: ch.department,
      })
    }
  }
}

export async function runOrchestrationCycle(): Promise<void> {
  console.log(`[${new Date().toISOString()}] Starting orchestration cycle...`)

  const customers = await getActiveCustomers()
  console.log(`Found ${customers.length} active customer(s)`)

  for (const ctx of customers) {
    try {
      await ensureChatChannels(ctx.customerId)

      // Run all agents in sequence
      await ceoAgent.runDailyBriefing(ctx)
      console.log(`✓ CEO briefing — ${ctx.customerId}`)

      await productAgent.runProductCycle(ctx)
      console.log(`✓ Product cycle — ${ctx.customerId}`)

      await engineeringAgent.runEngineeringUpdate(ctx)
      console.log(`✓ Engineering update — ${ctx.customerId}`)

      await marketingAgent.runMarketingBriefing(ctx)
      console.log(`✓ Marketing briefing — ${ctx.customerId}`)

      await salesAgent.runSalesUpdate(ctx)
      console.log(`✓ Sales update — ${ctx.customerId}`)

      await financeAgent.runFinanceBriefing(ctx)
      console.log(`✓ Finance briefing — ${ctx.customerId}`)

    } catch (err) {
      console.error(`Error processing customer ${ctx.customerId}:`, err)
    }
  }

  console.log(`[${new Date().toISOString()}] Orchestration cycle complete.`)
}
