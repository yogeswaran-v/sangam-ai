export interface ApprovalRequest {
  id: string
  customer_id: string
  card_id: string | null
  title: string
  description: string | null
  status: 'pending' | 'approved' | 'rejected'
  notification_sent_at: string | null
  responded_at: string | null
  created_at: string
}
