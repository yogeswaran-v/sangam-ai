import type { KanbanCard, KanbanColumn as ColType } from '@/types/kanban'
import { KanbanCardItem } from './KanbanCardItem'

const COLUMN_LABELS: Record<ColType, string> = {
  backlog: 'Backlog',
  in_progress: 'In Progress',
  review: 'Review',
  pending_approval: 'Pending Approval',
  done: 'Done',
}

const COLUMN_STYLES: Record<ColType, { accent: string; dot: string }> = {
  backlog: { accent: 'border-t-[#374151]', dot: 'bg-[#374151]' },
  in_progress: { accent: 'border-t-[#6366f1]', dot: 'bg-[#6366f1] shadow-[0_0_6px_rgba(99,102,241,0.8)]' },
  review: { accent: 'border-t-[#f59e0b]', dot: 'bg-[#f59e0b] shadow-[0_0_6px_rgba(245,158,11,0.8)]' },
  pending_approval: { accent: 'border-t-[#ef4444]', dot: 'bg-[#ef4444] shadow-[0_0_6px_rgba(239,68,68,0.8)]' },
  done: { accent: 'border-t-[#10b981]', dot: 'bg-[#10b981] shadow-[0_0_6px_rgba(16,185,129,0.8)]' },
}

interface Props {
  column: ColType
  cards: KanbanCard[]
  onMoveCard: (cardId: string, newColumn: ColType) => Promise<void>
}

const ALL_COLUMNS: ColType[] = ['backlog', 'in_progress', 'review', 'pending_approval', 'done']

export function KanbanColumn({ column, cards, onMoveCard }: Props) {
  const style = COLUMN_STYLES[column]

  return (
    <div className={`flex-shrink-0 w-72 bg-[#0d0d15] border border-[#1e1e2e] border-t-2 ${style.accent} rounded-xl flex flex-col`}>
      <div className="p-4 border-b border-[#1e1e2e]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
            <span
              className="text-sm font-semibold text-white"
              style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
            >
              {COLUMN_LABELS[column]}
            </span>
          </div>
          <span className="text-[10px] text-[#4b5563] font-bold tabular-nums bg-[#12121a] px-2 py-0.5 rounded-full border border-[#1e1e2e]">
            {cards.length}
          </span>
        </div>
      </div>
      <div
        className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-16rem)]"
        onDragOver={e => {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
          ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(124,58,237,0.06)'
        }}
        onDragLeave={e => {
          ;(e.currentTarget as HTMLDivElement).style.background = ''
        }}
        onDrop={e => {
          e.preventDefault()
          ;(e.currentTarget as HTMLDivElement).style.background = ''
          const cardId = e.dataTransfer.getData('cardId')
          if (cardId) onMoveCard(cardId, column)
        }}
      >
        {cards.length === 0 && (
          <div className="text-center text-[#374151] text-xs py-8 border border-dashed border-[#1e1e2e] rounded-lg">
            Empty
          </div>
        )}
        {cards.map(card => (
          <KanbanCardItem
            key={card.id}
            card={card}
            currentColumn={column}
            allColumns={ALL_COLUMNS}
            onMove={onMoveCard}
          />
        ))}
      </div>
    </div>
  )
}
