'use client'

import { useEffect, useRef } from 'react'
import type { ChatMessage } from '@/types/chat'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

interface Props {
  messages: ChatMessage[]
  loading: boolean
}

export function MessageFeed({ messages, loading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    // Only auto-scroll if user is near the bottom (within 150px)
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#6b7280] text-sm">
        Loading messages...
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#4b5563] text-sm">
        No messages yet. Agents will post here as they work.
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
      {messages.map(msg => (
        <div key={msg.id} className={`flex gap-3 ${msg.sender_type === 'ceo' ? 'flex-row-reverse' : ''}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
            msg.sender_type === 'ceo' ? 'bg-[#6366f1]/20 text-[#6366f1]' : 'bg-[#1e1e2e] text-[#9ca3af]'
          }`}>
            {msg.sender_type === 'ceo' ? '👤' : '🤖'}
          </div>
          <div className={`max-w-lg ${msg.sender_type === 'ceo' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
            <div className={`flex items-center gap-2 text-xs text-[#6b7280] ${msg.sender_type === 'ceo' ? 'flex-row-reverse' : ''}`}>
              <span className="font-medium text-[#9ca3af]">{msg.sender_name}</span>
              <span>{formatTime(msg.created_at)}</span>
            </div>
            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              msg.sender_type === 'ceo'
                ? 'bg-[#6366f1]/15 text-white border border-[#6366f1]/30 rounded-tr-sm'
                : 'bg-[#12121a] text-[#d1d5db] border border-[#1e1e2e] rounded-tl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
