'use client'

import { useState } from 'react'
import type { KanbanCard, KanbanColumn } from '@/types/kanban'

const PRIORITY_STYLES: Record<string, { text: string; bg: string; border: string }> = {
  low: { text: 'text-[#4b5563]', bg: 'bg-[#4b5563]/10', border: 'border-[#4b5563]/30' },
  medium: { text: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/10', border: 'border-[#f59e0b]/30' },
  high: { text: 'text-[#ef4444]', bg: 'bg-[#ef4444]/10', border: 'border-[#ef4444]/30' },
  critical: { text: 'text-[#dc2626]', bg: 'bg-[#dc2626]/10', border: 'border-[#dc2626]/40' },
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

  const priority = PRIORITY_STYLES[card.priority] ?? PRIORITY_STYLES.low

  return (
    <div
      className={`bg-[#07070a] border border-[#1e1e2e] rounded-xl p-3.5 transition-all duration-200 hover:border-[#6366f1]/20 group ${moving ? 'opacity-40 pointer-events-none' : ''}`}
      draggable
      onDragStart={e => {
        e.dataTransfer.setData('cardId', card.id)
        e.dataTransfer.effectAllowed = 'move'
        ;(e.currentTarget as HTMLDivElement).style.opacity = '0.4'
      }}
      onDragEnd={e => {
        ;(e.currentTarget as HTMLDivElement).style.opacity = '1'
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-sm text-white font-medium leading-snug">{card.title}</span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {card.requires_approval && !card.approved_by_ceo && (
            <span className="text-[10px] bg-red-500/15 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full font-medium">
              Approval
            </span>
          )}
          {card.approved_by_ceo && (
            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-medium">
              Approved
            </span>
          )}
        </div>
      </div>

      {card.description && (
        <p className="text-xs text-[#4b5563] mb-3 line-clamp-2 leading-relaxed">{card.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {card.assigned_agent && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}>
              {card.assigned_agent.replace(' Agent', '')}
            </span>
          )}
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${priority.text} ${priority.bg} ${priority.border}`}>
            {card.priority}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-[11px] text-[#374151] hover:text-[#818cf8] transition-colors px-1.5 py-0.5 rounded cursor-pointer"
          >
            Move ▾
          </button>
          {showMenu && (
            <div className="absolute right-0 top-6 z-10 bg-[#0d0d15] border border-[#1e1e2e] rounded-xl py-1.5 shadow-2xl min-w-40">
              {allColumns
                .filter(c => c !== currentColumn)
                .map(col => (
                  <button
                    key={col}
                    onClick={() => move(col)}
                    className="w-full text-left px-3 py-2 text-xs text-[#6b7280] hover:bg-[#6366f1]/10 hover:text-white transition-colors cursor-pointer"
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
