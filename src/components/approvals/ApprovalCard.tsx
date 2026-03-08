'use client'

import { useState } from 'react'
import type { ApprovalRequest } from '@/types/approvals'

interface Props {
  request: ApprovalRequest
  onApprove: (id: string) => Promise<void>
  onReject: (id: string) => Promise<void>
}

const STATUS_STYLES = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
}

const STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
}

export function ApprovalCard({ request, onApprove, onReject }: Props) {
  const [acting, setActing] = useState(false)

  async function handleApprove() {
    setActing(true)
    await onApprove(request.id)
    setActing(false)
  }

  async function handleReject() {
    setActing(true)
    await onReject(request.id)
    setActing(false)
  }

  return (
    <div className={`bg-[#12121a] border rounded-2xl p-6 flex flex-col gap-4 ${
      request.status === 'pending' ? 'border-amber-500/30' : 'border-[#1e1e2e]'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-1">{request.title}</h3>
          {request.description && (
            <p className="text-[#6b7280] text-sm leading-relaxed">{request.description}</p>
          )}
        </div>
        <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full border ${STATUS_STYLES[request.status]}`}>
          {STATUS_LABELS[request.status]}
        </span>
      </div>

      <div className="text-xs text-[#4b5563]">
        Requested {new Date(request.created_at).toLocaleString()}
        {request.responded_at && (
          <span className="ml-3">· Responded {new Date(request.responded_at).toLocaleString()}</span>
        )}
      </div>

      {request.status === 'pending' && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleApprove}
            disabled={acting}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {acting ? '...' : '✓ Approve'}
          </button>
          <button
            onClick={handleReject}
            disabled={acting}
            className="flex-1 py-2.5 bg-[#1e1e2e] hover:bg-red-500/20 hover:border-red-500/30 border border-[#1e1e2e] text-[#9ca3af] hover:text-red-400 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {acting ? '...' : '✕ Reject'}
          </button>
        </div>
      )}
    </div>
  )
}
