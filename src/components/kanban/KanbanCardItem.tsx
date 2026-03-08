'use client'

import { useState } from 'react'
import type { KanbanCard, KanbanColumn } from '@/types/kanban'

const PRIORITY_COLORS = {
  low: 'text-[#6b7280]',
  medium: 'text-[#f59e0b]',
  high: 'text-[#ef4444]',
  critical: 'text-[#dc2626]',
}

const COLUMN_LABELS: Record<KanbanColumn, string> = {
  backlog: 'Backlog',
  in_progress: 'In Progress',
  review: 'Review',
  pending_approval: 'Pending Approval',
  done: 'Done',
}

interface Props {
  card: KanbanCard
  currentColumn: KanbanColumn
  allColumns: KanbanColumn[]
  onMove: (cardId: string, newColumn: KanbanColumn) => Promise<void>
}

export function KanbanCardItem({ card, currentColumn, allColumns, onMove }: Props) {
  const [moving, setMoving] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  async function move(col: KanbanColumn) {
    setMoving(true)
    setShowMenu(false)
    await onMove(card.id, col)
    setMoving(false)
  }

  return (
    <div className={`bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg p-3 ${moving ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-sm text-white font-medium leading-snug">{card.title}</span>
        {card.requires_approval && !card.approved_by_ceo && (
          <span className="flex-shrink-0 text-xs bg-red-500/15 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded">
            Approval needed
          </span>
        )}
        {card.approved_by_ceo && (
          <span className="flex-shrink-0 text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
            Approved
          </span>
        )}
      </div>

      {card.description && (
        <p className="text-xs text-[#6b7280] mb-2 line-clamp-2">{card.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {card.assigned_agent && (
            <span className="text-xs text-[#6b7280]">{card.assigned_agent}</span>
          )}
          <span className={`text-xs font-medium ${PRIORITY_COLORS[card.priority]}`}>
            {card.priority}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-xs text-[#4b5563] hover:text-white transition-colors px-1"
          >
            Move ▾
          </button>
          {showMenu && (
            <div className="absolute right-0 top-6 z-10 bg-[#12121a] border border-[#1e1e2e] rounded-lg py-1 shadow-xl min-w-36">
              {allColumns
                .filter(c => c !== currentColumn)
                .map(col => (
                  <button
                    key={col}
                    onClick={() => move(col)}
                    className="w-full text-left px-3 py-2 text-xs text-[#9ca3af] hover:bg-[#1e1e2e] hover:text-white transition-colors"
                  >
                    → {COLUMN_LABELS[col]}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
