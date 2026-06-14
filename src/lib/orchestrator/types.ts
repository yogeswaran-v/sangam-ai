export interface AgentContext {
  customerId: string
  vision: string
  productRequirements: string
  monetaryGoals: string
  timeline: string
}

export interface AgentState {
  id: string
  customer_id: string
  agent_name: string
  last_action_at: string | null
  last_seen_message_at: string | null
  last_seen_approval_at: string | null
  last_seen_card_at: string | null
  current_focus: string | null
  waiting_on_approval_id: string | null
  last_event_summary: string | null
  created_at: string
  updated_at: string
}

export interface CardOp {
  op: 'move' | 'create' | 'comment'
  card_id?: string
  to_column?: 'backlog' | 'in_progress' | 'review' | 'pending_approval' | 'done'
  title?: string
  description?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  assigned_agent?: string
}

export interface InlineApproval {
  title: string
  question: string
  category: 'direction' | 'approval' | 'budget'
}

export type AgentAction =
  | {
      type: 'act'
      message: string
      card_ops?: CardOp[]
      approval_requests?: InlineApproval[]
      new_focus?: string
    }
  | {
      type: 'handoff'
      to_agent: string
      task_title: string
      task_description: string
      priority?: 'low' | 'medium' | 'high' | 'critical'
      message?: string
    }
  | {
      type: 'escalate'
      title: string
      question: string
      card_id?: string
      category: 'direction' | 'approval' | 'budget'
    }
  | {
      type: 'idle'
      reason: string
    }

export type TriggerType =
  | 'founder_message'
  | 'approval_resolved'
  | 'card_changed'
  | 'handoff'
  | 'heartbeat'

export type TriggerPriority = 'high' | 'normal' | 'low'

export interface Trigger {
  type: TriggerType
  priority: TriggerPriority
  detail?: string
}

export interface WakeDecision {
  shouldWake: boolean
  triggers: Trigger[]
  priority: TriggerPriority | null
}
