export interface TokenUsageRow {
  id: string
  customer_id: string
  agent_name: string
  input_tokens: number
  output_tokens: number
  cost_usd: number
  recorded_at: string
}

export interface UsageSummary {
  totalInputTokens: number
  totalOutputTokens: number
  totalCostUsd: number
  byAgent: Record<string, { input: number; output: number; cost: number }>
}
