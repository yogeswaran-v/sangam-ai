import { supabaseAdmin } from '@/lib/supabase/admin'
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

const CHANNELS = [
  { name: 'CEO Updates', department: 'leadership' },
  { name: 'Engineering', department: 'engineering' },
  { name: 'Product', department: 'product' },
  { name: 'Marketing', department: 'marketing' },
  { name: 'Sales', department: 'sales' },
  { name: 'Finance', department: 'finance' },
]

async function ensureChatChannels(customerId: string): Promise<void> {
  for (const ch of CHANNELS) {
    const { data: existing } = await supabaseAdmin
      .from('chat_channels')
      .select('id')
      .eq('customer_id', customerId)
      .eq('name', ch.name)
      .single()

    if (!existing) {
      await supabaseAdmin.from('chat_channels').insert({
        customer_id: customerId,
        name: ch.name,
        department: ch.department,
      })
    }
  }
}

async function getActiveCustomers(): Promise<AgentContext[]> {
  const { data: teams, error } = await supabaseAdmin
    .from('agent_teams')
    .select('customer_id')
    .eq('status', 'active')
    .eq('onboarding_complete', true)

  if (error || !teams || teams.length === 0) {
    if (error) console.error('Error fetching teams:', error)
    return []
  }

  const contexts: AgentContext[] = []
  for (const team of teams) {
    const { data: mc } = await supabaseAdmin
      .from('mission_control')
      .select('vision, product_requirements, monetary_goals, timeline')
      .eq('customer_id', team.customer_id)
      .single()

    contexts.push({
      customerId: team.customer_id,
      vision: mc?.vision ?? '',
      productRequirements: mc?.product_requirements ?? '',
      monetaryGoals: mc?.monetary_goals ?? '',
      timeline: mc?.timeline ?? '',
    })
  }
  return contexts
}

export async function runOrchestrationCycle(): Promise<{ processed: number }> {
  const customers = await getActiveCustomers()
  console.log(`[orchestrator] ${customers.length} active customer(s)`)

  let processed = 0
  for (const ctx of customers) {
    try {
      await ensureChatChannels(ctx.customerId)
      await ceoAgent.runDailyBriefing(ctx)
      await productAgent.runProductCycle(ctx)
      await engineeringAgent.runEngineeringUpdate(ctx)
      await marketingAgent.runMarketingBriefing(ctx)
      await salesAgent.runSalesUpdate(ctx)
      await financeAgent.runFinanceBriefing(ctx)
      processed++
      console.log(`[orchestrator] ✓ ${ctx.customerId}`)
    } catch (err: any) {
      if (err?.name === 'SpendCapError') {
        console.warn(`[orchestrator] Spend cap: ${err.message}`)
        break
      }
      console.error(`[orchestrator] Error for ${ctx.customerId}:`, err)
    }
  }

  return { processed }
}
