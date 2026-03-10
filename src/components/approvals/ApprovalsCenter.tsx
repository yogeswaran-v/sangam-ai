'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ApprovalRequest } from '@/types/approvals'
import { ApprovalCard } from './ApprovalCard'

type Filter = 'pending' | 'approved' | 'rejected' | 'all'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'pending',  label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all',      label: 'All' },
]

const EmptyCheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
)
const EmptyClockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)

export function ApprovalsCenter() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([])
  const [filter, setFilter] = useState<Filter>('pending')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchRequests = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!customer) { setLoading(false); return }

    let query = supabase
      .from('approval_requests')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })

    if (filter !== 'all') query = query.eq('status', filter)

    const { data } = await query
    setRequests((data ?? []) as ApprovalRequest[])
    setLoading(false)
  }, [supabase, filter])

  useEffect(() => { setLoading(true); fetchRequests() }, [fetchRequests])

  useEffect(() => {
    const channel = supabase
      .channel('approval_requests_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'approval_requests' }, () => fetchRequests())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchRequests])

  async function handleApprove(id: string) {
    await supabase
      .from('approval_requests')
      .update({ status: 'approved', responded_at: new Date().toISOString() })
      .eq('id', id)

    const req = requests.find(r => r.id === id)
    if (req?.card_id) {
      await supabase
        .from('kanban_cards')
        .update({ approved_by_ceo: true, approved_at: new Date().toISOString() })
        .eq('id', req.card_id)
    }
    await fetchRequests()
  }

  async function handleReject(id: string) {
    await supabase
      .from('approval_requests')
      .update({ status: 'rejected', responded_at: new Date().toISOString() })
      .eq('id', id)
    await fetchRequests()
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-7">
        {FILTERS.map(f => {
          const active = filter === f.value
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="relative px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer"
              style={active ? {
                background: 'rgba(124,58,237,0.1)',
                color: '#eef2f8',
                border: '1px solid rgba(167,139,250,0.2)',
              } : {
                color: '#4a566e',
                border: '1px solid transparent',
                background: 'transparent',
              }}
            >
              {f.label}
              {f.value === 'pending' && pendingCount > 0 && (
                <span className="ml-2 text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                  {pendingCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16 text-[13px]" style={{ color: '#4a566e' }}>
          Loading…
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{
              background: filter === 'pending' ? 'rgba(34,197,94,0.08)' : 'rgba(124,58,237,0.08)',
              border: `1px solid ${filter === 'pending' ? 'rgba(34,197,94,0.2)' : 'rgba(167,139,250,0.2)'}`,
              color: filter === 'pending' ? '#22c55e' : '#a78bfa',
            }}>
            {filter === 'pending' ? <EmptyCheckIcon /> : <EmptyClockIcon />}
          </div>
          <p className="text-[14px] font-semibold mb-1" style={{ color: '#eef2f8', fontFamily: 'var(--font-bricolage)' }}>
            {filter === 'pending' ? 'All clear' : 'Nothing here'}
          </p>
          <p className="text-[13px]" style={{ color: '#4a566e' }}>
            {filter === 'pending'
              ? 'No pending approvals. Agents are working autonomously.'
              : `No ${filter} requests found.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map(req => (
            <ApprovalCard
              key={req.id}
              request={req}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  )
}
