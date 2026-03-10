'use client'

import { useState } from 'react'
import type { ApprovalRequest } from '@/types/approvals'

interface Props {
  request: ApprovalRequest
  onApprove: (id: string) => Promise<void>
  onReject: (id: string) => Promise<void>
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  return hrs < 24 ? `${hrs}h ago` : `${Math.floor(hrs / 24)}d ago`
}

const ApproveIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const RejectIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const CardIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)

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

  const isPending  = request.status === 'pending'
  const isApproved = request.status === 'approved'

  const statusStyle = {
    pending:  { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)',  text: '#f59e0b' },
    approved: { bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.25)',   text: '#22c55e' },
    rejected: { bg: 'rgba(244,63,94,0.08)',   border: 'rgba(244,63,94,0.25)',   text: '#f43f5e' },
  }[request.status]

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4 transition-colors duration-200"
      style={{
        background: '#0b1018',
        border: `1px solid ${isPending ? 'rgba(245,158,11,0.2)' : '#1a2236'}`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Linked card badge */}
          {request.card_id && (
            <div className="flex items-center gap-1.5 mb-2">
              <span style={{ color: '#4a566e' }}><CardIcon /></span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4a566e' }}>
                Kanban task
              </span>
            </div>
          )}
          <h3 className="font-bold text-[15px] leading-snug" style={{ fontFamily: 'var(--font-bricolage)', color: '#eef2f8' }}>
            {request.title}
          </h3>
        </div>
        <span className="flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full"
          style={{ background: statusStyle.bg, border: `1px solid ${statusStyle.border}`, color: statusStyle.text }}>
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      </div>

      {/* Description */}
      {request.description && (
        <p className="text-[13px] leading-relaxed" style={{ color: '#8b98b4' }}>
          {request.description}
        </p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 text-[11px]" style={{ color: '#4a566e' }}>
        <span>{timeAgo(request.created_at)}</span>
        {request.responded_at && (
          <>
            <span>·</span>
            <span>Responded {timeAgo(request.responded_at)}</span>
          </>
        )}
      </div>

      {/* Actions */}
      {isPending && (
        <div className="flex gap-2.5">
          <button
            onClick={handleApprove}
            disabled={acting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-200 disabled:opacity-50 cursor-pointer"
            style={{ background: '#166534', border: '1px solid rgba(34,197,94,0.3)' }}
          >
            <ApproveIcon />
            {acting ? 'Saving…' : 'Approve'}
          </button>
          <button
            onClick={handleReject}
            disabled={acting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 disabled:opacity-50 cursor-pointer"
            style={{ background: 'transparent', border: '1px solid #1a2236', color: '#8b98b4' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(244,63,94,0.08)'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(244,63,94,0.3)'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#f43f5e'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#1a2236'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#8b98b4'
            }}
          >
            <RejectIcon />
            {acting ? '…' : 'Reject'}
          </button>
        </div>
      )}

      {/* Resolved state */}
      {!isPending && (
        <div className="flex items-center gap-2 text-[12px] font-medium"
          style={{ color: isApproved ? '#22c55e' : '#f43f5e' }}>
          {isApproved ? <ApproveIcon /> : <RejectIcon />}
          {isApproved ? 'You approved this' : 'You rejected this'}
        </div>
      )}
    </div>
  )
}
