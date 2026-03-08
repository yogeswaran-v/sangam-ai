'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TokenUsageRow, UsageSummary } from '@/types/usage'

const PLAN_LIMITS = {
  starter: { tokens: 100_000, label: 'Starter', price: { usd: 49, inr: 3999 } },
  pro: { tokens: 500_000, label: 'Pro', price: { usd: 149, inr: 11999 } },
  scale: { tokens: Infinity, label: 'Scale', price: { usd: 399, inr: 32999 } },
}

function computeSummary(rows: TokenUsageRow[]): UsageSummary {
  const summary: UsageSummary = {
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCostUsd: 0,
    byAgent: {},
  }
  for (const row of rows) {
    summary.totalInputTokens += row.input_tokens
    summary.totalOutputTokens += row.output_tokens
    summary.totalCostUsd += Number(row.cost_usd)
    if (!summary.byAgent[row.agent_name]) {
      summary.byAgent[row.agent_name] = { input: 0, output: 0, cost: 0 }
    }
    summary.byAgent[row.agent_name].input += row.input_tokens
    summary.byAgent[row.agent_name].output += row.output_tokens
    summary.byAgent[row.agent_name].cost += Number(row.cost_usd)
  }
  return summary
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

async function handleUpgrade(targetPlan: string) {
  const res = await fetch('/api/billing/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan: targetPlan }),
  })
  const data = await res.json()
  if (data.provider === 'stripe' && data.url) {
    window.location.href = data.url
  } else if (data.provider === 'razorpay') {
    // Razorpay inline checkout — load script dynamically
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    document.body.appendChild(script)
    script.onload = () => {
      const rzp = new (window as any).Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: 'Sangam.ai',
        description: `${targetPlan} plan subscription`,
        handler: async (response: any) => {
          await fetch('/api/billing/webhook/razorpay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              plan: targetPlan,
              customer_id: '', // will be resolved server-side from auth
            }),
          })
          window.location.reload()
        },
      })
      rzp.open()
    }
  }
}

export function UsageDashboard() {
  const [summary, setSummary] = useState<UsageSummary | null>(null)
  const [plan, setPlan] = useState<'starter' | 'pro' | 'scale'>('starter')
  const [currency, setCurrency] = useState<'usd' | 'inr'>('usd')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchUsage = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: customer } = await supabase
      .from('customers')
      .select('id, plan, currency')
      .eq('user_id', user.id)
      .single()

    if (!customer) { setLoading(false); return }

    setPlan((customer.plan as 'starter' | 'pro' | 'scale') ?? 'starter')
    setCurrency((customer.currency as 'usd' | 'inr') ?? 'usd')

    // Current month usage
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: rows } = await supabase
      .from('token_usage')
      .select('*')
      .eq('customer_id', customer.id)
      .gte('recorded_at', startOfMonth.toISOString())

    setSummary(computeSummary((rows ?? []) as TokenUsageRow[]))
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchUsage() }, [fetchUsage])

  if (loading) {
    return <div className="flex justify-center py-16 text-[#6b7280] text-sm">Loading usage data...</div>
  }

  const planInfo = PLAN_LIMITS[plan]
  const totalTokens = (summary?.totalInputTokens ?? 0) + (summary?.totalOutputTokens ?? 0)
  const usagePct = planInfo.tokens === Infinity ? 0 : Math.min(100, (totalTokens / planInfo.tokens) * 100)
  const planPrice = currency === 'inr' ? `₹${planInfo.price.inr.toLocaleString('en-IN')}/mo` : `$${planInfo.price.usd}/mo`

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Plan card */}
      <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs text-[#6b7280] uppercase tracking-widest mb-1">Current Plan</div>
            <div className="text-2xl font-bold text-white">{planInfo.label}</div>
            <div className="text-[#6b7280] text-sm mt-1">{planPrice}</div>
          </div>
          <button onClick={() => handleUpgrade('pro')} className="px-4 py-2 border border-[#6366f1]/50 text-[#6366f1] rounded-xl text-sm hover:bg-[#6366f1]/10 transition-colors">
            Upgrade plan
          </button>
        </div>

        {/* Token usage bar */}
        <div>
          <div className="flex justify-between text-xs text-[#6b7280] mb-2">
            <span>Token usage this month</span>
            <span>
              {fmt(totalTokens)} / {planInfo.tokens === Infinity ? 'Unlimited' : fmt(planInfo.tokens)}
            </span>
          </div>
          <div className="h-2 bg-[#0a0a0f] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${usagePct > 80 ? 'bg-red-500' : usagePct > 60 ? 'bg-amber-500' : 'bg-[#6366f1]'}`}
              style={{ width: `${usagePct}%` }}
            />
          </div>
          {planInfo.tokens !== Infinity && (
            <p className="text-xs text-[#4b5563] mt-2">{usagePct.toFixed(1)}% of monthly limit used</p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Input Tokens', value: fmt(summary?.totalInputTokens ?? 0), icon: '📥' },
          { label: 'Output Tokens', value: fmt(summary?.totalOutputTokens ?? 0), icon: '📤' },
          { label: 'Total Cost', value: `$${(summary?.totalCostUsd ?? 0).toFixed(4)}`, icon: '💰' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-5">
            <div className="text-2xl mb-3">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-[#6b7280] mt-1">{stat.label} this month</div>
          </div>
        ))}
      </div>

      {/* Per-agent breakdown */}
      {summary && Object.keys(summary.byAgent).length > 0 && (
        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[#1e1e2e]">
            <h3 className="text-sm font-semibold text-white">Usage by Agent</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e2e]">
                <th className="text-left px-4 py-3 text-xs text-[#6b7280] font-medium">Agent</th>
                <th className="text-right px-4 py-3 text-xs text-[#6b7280] font-medium">Input</th>
                <th className="text-right px-4 py-3 text-xs text-[#6b7280] font-medium">Output</th>
                <th className="text-right px-4 py-3 text-xs text-[#6b7280] font-medium">Cost</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summary.byAgent)
                .sort((a, b) => b[1].cost - a[1].cost)
                .map(([agentName, stats]) => (
                  <tr key={agentName} className="border-b border-[#1e1e2e]/50 hover:bg-[#0a0a0f]/50 transition-colors">
                    <td className="px-4 py-3 text-[#d1d5db]">{agentName}</td>
                    <td className="px-4 py-3 text-right text-[#6b7280]">{fmt(stats.input)}</td>
                    <td className="px-4 py-3 text-right text-[#6b7280]">{fmt(stats.output)}</td>
                    <td className="px-4 py-3 text-right text-[#9ca3af]">${stats.cost.toFixed(4)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {summary && Object.keys(summary.byAgent).length === 0 && (
        <div className="text-center py-12 text-[#4b5563] text-sm">
          No usage recorded yet this month. Agents will log activity as they work.
        </div>
      )}
    </div>
  )
}
