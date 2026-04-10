'use client'

import type { KanbanCard } from '@/types/kanban'

const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-[#4b5563] bg-[#4b5563]/10 border-[#4b5563]/30',
  medium: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30',
  high: 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/30',
  critical: 'text-[#dc2626] bg-[#dc2626]/10 border-[#dc2626]/40',
}

interface Props {
  card: KanbanCard
  onClose: () => void
}

export function KanbanCardModal({ card, onClose }: Props) {
  const priority = PRIORITY_COLORS[card.priority] ?? PRIORITY_COLORS.low
  const createdAt = new Date(card.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-[#07070a] border border-[#1e1e2e] rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-white font-semibold text-base leading-snug">{card.title}</h2>
          <button
            onClick={onClose}
            className="text-[#374151] hover:text-white transition-colors flex-shrink-0 mt-0.5 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Description */}
        {card.description ? (
          <p className="text-sm text-[#9ca3af] leading-relaxed mb-5">{card.description}</p>
        ) : (
          <p className="text-sm text-[#374151] italic mb-5">No description</p>
        )}

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-[#0d0d15] border border-[#1e1e2e] rounded-xl p-3">
            <p className="text-[10px] text-[#4b5563] uppercase tracking-wide mb-1">Priority</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${priority}`}>
              {card.priority}
            </span>
          </div>

          <div className="bg-[#0d0d15] border border-[#1e1e2e] rounded-xl p-3">
            <p className="text-[10px] text-[#4b5563] uppercase tracking-wide mb-1">Status</p>
            <span className="text-xs text-[#9ca3af] capitalize">{card.column_name.replace('_', ' ')}</span>
          </div>

          {card.assigned_agent && (
            <div className="bg-[#0d0d15] border border-[#1e1e2e] rounded-xl p-3">
              <p className="text-[10px] text-[#4b5563] uppercase tracking-wide mb-1">Assigned</p>
              <span className="text-xs font-semibold" style={{ color: '#a78bfa' }}>
                {card.assigned_agent}
              </span>
            </div>
          )}

          <div className="bg-[#0d0d15] border border-[#1e1e2e] rounded-xl p-3">
            <p className="text-[10px] text-[#4b5563] uppercase tracking-wide mb-1">Created</p>
            <span className="text-xs text-[#9ca3af]">{createdAt}</span>
          </div>
        </div>

        {/* Approval status */}
        {card.requires_approval && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium ${
            card.approved_by_ceo
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <span>{card.approved_by_ceo ? '✓ Approved by CEO' : '⏳ Awaiting CEO approval'}</span>
          </div>
        )}
      </div>
    </div>
  )
}
