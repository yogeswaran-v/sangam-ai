import type { KanbanCard, KanbanColumn as ColType } from '@/types/kanban'
import { KanbanCardItem } from './KanbanCardItem'

const COLUMN_LABELS: Record<ColType, string> = {
  backlog: 'Backlog',
  in_progress: 'In Progress',
  review: 'Review',
  pending_approval: 'Pending Approval',
  done: 'Done',
}

const COLUMN_COLORS: Record<ColType, string> = {
  backlog: 'border-t-[#4b5563]',
  in_progress: 'border-t-[#6366f1]',
  review: 'border-t-[#f59e0b]',
  pending_approval: 'border-t-[#ef4444]',
  done: 'border-t-[#10b981]',
}

interface Props {
  column: ColType
  cards: KanbanCard[]
  onMoveCard: (cardId: string, newColumn: ColType) => Promise<void>
}

const ALL_COLUMNS: ColType[] = ['backlog', 'in_progress', 'review', 'pending_approval', 'done']

export function KanbanColumn({ column, cards, onMoveCard }: Props) {
  return (
    <div className={`flex-shrink-0 w-72 bg-[#12121a] border border-[#1e1e2e] border-t-2 ${COLUMN_COLORS[column]} rounded-xl flex flex-col`}>
      <div className="p-4 border-b border-[#1e1e2e]">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white">{COLUMN_LABELS[column]}</span>
          <span className="text-xs text-[#6b7280] bg-[#0a0a0f] px-2 py-0.5 rounded-full">
            {cards.length}
          </span>
        </div>
      </div>
      <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-16rem)]">
        {cards.length === 0 && (
          <div className="text-center text-[#4b5563] text-xs py-8">No tasks</div>
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
