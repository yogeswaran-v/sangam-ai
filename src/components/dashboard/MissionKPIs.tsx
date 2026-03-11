'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface MissionData {
  monetary_goals: string | null
  timeline: string | null
  created_at: string | null
}

function parseBudget(text: string | null): { amount: number; currency: string } | null {
  if (!text) return null
  // Match patterns like: 10000 INR, ₹10,000, $5000, 10k INR, 2 lakh
  const inrMatch = text.match(/(?:₹|INR\s*)[\s]*([\d,]+(?:\.\d+)?)\s*(?:k|K|lakh|L)?/i)
    || text.match(/([\d,]+(?:\.\d+)?)\s*(?:k|K|lakh|L)?\s*INR/i)
    || text.match(/₹\s*([\d,]+)/i)
  if (inrMatch) {
    let n = parseFloat(inrMatch[1].replace(/,/g, ''))
    const lower = text.toLowerCase()
    if (lower.includes('lakh') || lower.includes(' l ') || /\d\s*l\b/i.test(text)) n *= 100000
    else if (lower.includes('k') || /\dk\b/i.test(text)) n *= 1000
    return { amount: n, currency: 'INR' }
  }
  const usdMatch = text.match(/\$\s*([\d,]+(?:\.\d+)?)\s*(?:k|K)?/)
  if (usdMatch) {
    let n = parseFloat(usdMatch[1].replace(/,/g, ''))
    if (text.toLowerCase().includes('k')) n *= 1000
    return { amount: n, currency: 'USD' }
  }
  return null
}

function parseDeadline(text: string | null): { days: number; label: string } | null {
  if (!text) return null
  const weeks = text.match(/(\d+)\s*week/i)
  if (weeks) return { days: parseInt(weeks[1]) * 7, label: `${weeks[1]}w` }
  const months = text.match(/(\d+)\s*month/i)
  if (months) return { days: parseInt(months[1]) * 30, label: `${months[1]}mo` }
  const days = text.match(/(\d+)\s*day/i)
  if (days) return { days: parseInt(days[1]), label: `${days[1]}d` }
  return null
}

function formatCurrency(amount: number, currency: string): string {
  if (currency === 'INR') {
    if (amount >= 100000) return `${'\u20b9'}${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `${'\u20b9'}${(amount / 1000).toFixed(0)}K`
    return `${'\u20b9'}${amount.toFixed(0)}`
  }
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`
  return `$${amount.toFixed(0)}`
}

export function MissionKPIs() {
  const [data, setData] = useState<MissionData | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: customer } = await supabase.from('customers').select('id').eq('user_id', user.id).single()
      if (!customer) return
      const { data: mc } = await supabase.from('mission_control')
        .select('monetary_goals, timeline, created_at')
        .eq('customer_id', customer.id)
        .single()
      if (mc) setData(mc as MissionData)
    }
    load()
  }, [supabase])

  if (!data) return null

  const budget = parseBudget(data.monetary_goals)
  const deadline = parseDeadline(data.timeline)
  const startDate = data.created_at ? new Date(data.created_at) : null
  const elapsedDays = startDate ? Math.floor((Date.now() - startDate.getTime()) / 86400000) : 0

  if (!budget && !deadline) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {budget && (
        <KPIBar
          label="Budget"
          sublabel={data.monetary_goals?.slice(0, 60) ?? ''}
          current={0}
          total={budget.amount}
          currentLabel={formatCurrency(0, budget.currency)}
          totalLabel={formatCurrency(budget.amount, budget.currency)}
          color="#14b8a6"
          pct={0}
          note="No spend tracked yet"
        />
      )}
      {deadline && (
        <KPIBar
          label="Timeline"
          sublabel={data.timeline?.slice(0, 60) ?? ''}
          current={elapsedDays}
          total={deadline.days}
          currentLabel={`Day ${elapsedDays}`}
          totalLabel={deadline.label}
          color={elapsedDays / deadline.days > 0.8 ? '#f43f5e' : elapsedDays / deadline.days > 0.5 ? '#f59e0b' : '#a78bfa'}
          pct={Math.min(100, (elapsedDays / deadline.days) * 100)}
          note={`${Math.max(0, deadline.days - elapsedDays)} days remaining`}
        />
      )}
    </div>
  )
}

function KPIBar({ label, sublabel, currentLabel, totalLabel, color, pct, note }: {
  label: string; sublabel: string; current: number; total: number
  currentLabel: string; totalLabel: string; color: string; pct: number; note: string
}) {
  return (
    <div className="rounded-2xl p-5" style={{ background: '#0b1018', border: '1px solid #1a2236' }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: '#4a566e' }}>{label}</div>
          <div className="text-[11px] mt-0.5 line-clamp-1" style={{ color: '#2e3b52' }}>{sublabel}</div>
        </div>
        <div className="text-right">
          <div className="text-[18px] font-bold" style={{ color, fontFamily: 'var(--font-bricolage)' }}>{currentLabel}</div>
          <div className="text-[10px]" style={{ color: '#4a566e' }}>of {totalLabel}</div>
        </div>
      </div>
      {/* Bar */}
      <div className="rounded-full h-1.5 overflow-hidden" style={{ background: '#1a2236' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.max(2, pct)}%`, background: color, boxShadow: `0 0 8px ${color}60` }}
        />
      </div>
      <div className="text-[11px] mt-2" style={{ color: '#4a566e' }}>{note}</div>
    </div>
  )
}
