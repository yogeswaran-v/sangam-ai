'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { KanbanCard, KanbanBoard as BoardType, KanbanColumn } from '@/types/kanban'
import { KanbanColumn as KanbanColumnComp } from './KanbanColumn'

const COLUMNS: KanbanColumn[] = ['backlog', 'in_progress', 'review', 'pending_approval', 'done']

export function KanbanBoard() {
  const [board, setBoard] = useState<BoardType | null>(null)
  const [cards, setCards] = useState<KanbanCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchBoard = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get customer
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!customer) {
      setError('Customer record not found')
      setLoading(false)
      return
    }

    // Get or create board
    let { data: board } = await supabase
      .from('kanban_boards')
      .select('id, customer_id')
      .eq('customer_id', customer.id)
      .single()

    if (!board) {
      const { data: newBoard } = await supabase
        .from('kanban_boards')
        .insert({ customer_id: customer.id })
        .select('id, customer_id')
        .single()
      board = newBoard
    }

    if (!board) {
      setError('Could not load board')
      setLoading(false)
      return
    }

    setBoard(board as BoardType)

    // Get cards
    const { data: cardRows } = await supabase
      .from('kanban_cards')
      .select('*')
      .eq('board_id', board.id)
      .order('created_at', { ascending: true })

    setCards((cardRows ?? []) as KanbanCard[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchBoard()
  }, [fetchBoard])

  // Real-time subscription
  useEffect(() => {
    if (!board) return
    const channel = supabase
      .channel(`kanban_board_${board.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'kanban_cards',
        filter: `board_id=eq.${board.id}`,
      }, () => {
        fetchBoard()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [board, supabase, fetchBoard])

  async function handleMoveCard(cardId: string, newColumn: KanbanColumn) {
    await supabase
      .from('kanban_cards')
      .update({ column_name: newColumn, updated_at: new Date().toISOString() })
      .eq('id', cardId)

    setCards(prev => prev.map(c => c.id === cardId ? { ...c, column_name: newColumn } : c))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-[#374151]">
        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <span className="text-sm">Loading board...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400 text-sm">
        {error}
      </div>
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map(col => (
        <KanbanColumnComp
          key={col}
          column={col}
          cards={cards.filter(c => c.column_name === col)}
          onMoveCard={handleMoveCard}
        />
      ))}
    </div>
  )
}
