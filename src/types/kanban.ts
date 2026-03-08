export type KanbanColumn = 'backlog' | 'in_progress' | 'review' | 'pending_approval' | 'done'

export interface KanbanCard {
  id: string
  board_id: string
  title: string
  description: string | null
  column_name: KanbanColumn
  assigned_agent: string | null
  priority: 'low' | 'medium' | 'high' | 'critical'
  requires_approval: boolean
  approved_by_ceo: boolean | null
  created_at: string
}

export interface KanbanBoard {
  id: string
  customer_id: string
}
