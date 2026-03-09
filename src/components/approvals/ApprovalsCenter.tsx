'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ApprovalRequest } from '@/types/approvals'
import { ApprovalCard } from './ApprovalCard'

type Filter = 'all' | 'pending' | 'approved' | 'rejected'

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

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data } = await query
    setRequests((data ?? []) as ApprovalRequest[])
    setLoading(false)
  }, [supabase, filter])

  useEffect(() => {
    setLoading(true)
    fetchRequests()
  }, [fetchRequests])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('approval_requests_live')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'approval_requests',
      }, () => { fetchRequests() })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchRequests])

  async function handleApprove(id: string) {
    await supabase
      .from('approval_requests')
      .update({ status: 'approved', responded_at: new Date().toISOString() })
      .eq('id', id)

    // Also approve the linked kanban card if any
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

  const FILTERS: { value: Filter; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'all', label: 'All' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ]

  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm transition-all duration-200 cursor-pointer font-medium ${
              filter === f.value
                ? 'bg-[#6366f1]/15 text-white border border-[#6366f1]/30 shadow-[0_0_8px_rgba(99,102,241,0.1)]'
                : 'text-[#4b5563] hover:text-white border border-transparent hover:bg-[#12121a]'
            }`}
          >
            {f.label}
            {f.value === 'pending' && pendingCount > 0 && (
              <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16 text-[#6b7280] text-sm">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4 text-emerald-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <p className="text-[#6b7280] text-sm">
            {filter === 'pending' ? 'No pending approvals. Your agents are operating autonomously.' : 'No requests found.'}
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
