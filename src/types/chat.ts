export interface ChatChannel {
  id: string
  customer_id: string
  name: string
  department: string
}

export interface ChatMessage {
  id: string
  channel_id: string
  sender_name: string
  sender_type: 'agent' | 'ceo'
  content: string
  created_at: string
}
