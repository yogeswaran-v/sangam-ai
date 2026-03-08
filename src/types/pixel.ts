export interface AgentPixel {
  id: string
  name: string
  emoji: string
  color: string
  status: 'idle' | 'working' | 'complete'
  currentTask?: string
  x: number
  y: number
}

export interface AgentEvent {
  id: string
  agent_name: string
  event_type: string
  payload: Record<string, unknown> | null
  created_at: string
}
