'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const KanbanIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="5" height="18" rx="1" /><rect x="10" y="3" width="5" height="11" rx="1" /><rect x="17" y="3" width="5" height="15" rx="1" />
  </svg>
)
const ApprovalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
)
const ChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)
const ZapIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

interface Stats {
  activeTasks: number
  pendingApprovals: number
  messagesToday: number
  costThisMonth: number
}

export function LiveStats() {
  const [stats, setStats] = useState<Stats>({ activeTasks: 0, pendingApprovals: 0, messagesToday: 0, costThisMonth: 0 })
  const supabase = createClient()

  const fetchStats = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: customer } = await supabase.from('customers').select('id').eq('user_id', user.id).single()
    if (!customer) return

    const { data: board } = await supabase.from('kanban_boards').select('id').eq('customer_id', customer.id).single()

    const [activeResult, approvalResult, msgResult, usageResult] = await Promise.all([
      board
        ? supabase.from('kanban_cards').select('id', { count: 'exact', head: true })
            .eq('board_id', board.id).in('column_name', ['in_progress', 'review'])
        : Promise.resolve({ count: 0 }),

      supabase.from('approval_requests').select('id', { count: 'exact', head: true })
        .eq('customer_id', customer.id).eq('status', 'pending'),

      supabase.from('chat_messages').select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),

      supabase.from('token_usage').select('cost_usd')
        .eq('customer_id', customer.id)
        .gte('recorded_at', new Date(new Date(new Date().setDate(1)).setHours(0,0,0,0)).toISOString()),
    ])

    const costThisMonth = ((usageResult as any).data ?? []).reduce((sum: number, r: { cost_usd: number }) => sum + Number(r.cost_usd), 0)

    setStats({
      activeTasks: (activeResult as any).count ?? 0,
      pendingApprovals: (approvalResult as any).count ?? 0,
      messagesToday: (msgResult as any).count ?? 0,
      costThisMonth,
    })
  }, [supabase])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30_000)
    return () => clearInterval(interval)
  }, [fetchStats])

  // Realtime subscription for instant approval updates
  useEffect(() => {
    const channel = supabase.channel('stats_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'approval_requests' }, fetchStats)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, fetchStats)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchStats])

  const cards = [
    { label: 'Tasks Active', value: stats.activeTasks || '—', Icon: KanbanIcon, href: '/dashboard/kanban', accent: '#a78bfa', accentDim: 'rgba(124,58,237,0.08)', accentBorder: 'rgba(167,139,250,0.2)' },
    { label: 'Pending Approvals', value: stats.pendingApprovals || '—', Icon: ApprovalIcon, href: '/dashboard/approvals', accent: '#fb923c', accentDim: 'rgba(251,146,60,0.08)', accentBorder: 'rgba(251,146,60,0.2)' },
    { label: 'Messages Today', value: stats.messagesToday || '—', Icon: ChatIcon, href: '/dashboard/chat', accent: '#38bdf8', accentDim: 'rgba(56,189,248,0.08)', accentBorder: 'rgba(56,189,248,0.2)' },
    {
      label: 'Spend / Month',
      value: stats.costThisMonth > 0 ? `$${stats.costThisMonth.toFixed(2)}` : '—',
      Icon: ZapIcon,
      href: '/dashboard/usage',
      accent: '#4ade80',
      accentDim: 'rgba(74,222,128,0.08)',
      accentBorder: 'rgba(74,222,128,0.2)',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {cards.map(stat => (
        <Link
          key={stat.label}
          href={stat.href}
          className="stat-card relative rounded-xl p-5 cursor-pointer block"
          style={{
            background: '#0b1018',
            border: '1px solid #1a2236',
            ['--card-border-hover' as string]: stat.accentBorder,
          }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-4" style={{ background: stat.accentDim, color: stat.accent }}>
            <stat.Icon />
          </div>
          <div className="text-[26px] font-extrabold text-[#eef2f8] mb-1 leading-none" style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>
            {stat.value}
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4a566e' }}>
            {stat.label}
          </div>
        </Link>
      ))}
    </div>
  )
}
