export type Plan = 'starter' | 'pro' | 'scale'
export type Currency = 'usd' | 'inr'
export type NotificationChannel = 'telegram' | 'whatsapp' | 'email'
export type DockerStatus = 'running' | 'stopped' | 'provisioning'
export type AgentMood = 'focused' | 'idle' | 'stressed' | 'collaborating'
export type KanbanColumn = 'backlog' | 'in_progress' | 'review' | 'pending_approval' | 'done'
export type SenderType = 'agent' | 'ceo'

export interface Customer {
  id: string
  user_id: string
  email: string
  name?: string
  plan: Plan
  currency: Currency
  notification_channel: NotificationChannel
  docker_status: DockerStatus
  created_at: string
}

export interface AgentEvent {
  type: string
  customerId: string
  agentName: string
  payload: Record<string, unknown>
  timestamp: string
}
