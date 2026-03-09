'use client'

import { useEffect, useRef } from 'react'
import type { ChatMessage } from '@/types/chat'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)

const BotIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    <line x1="12" y1="3" x2="12" y2="7" />
    <circle cx="9" cy="16" r="1" />
    <circle cx="15" cy="16" r="1" />
  </svg>
)

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
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center gap-2 text-[#374151] text-sm">
        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        Loading messages...
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#374151] text-sm">
        No messages yet. Agents will post here as they work.
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
      {messages.map(msg => (
        <div key={msg.id} className={`flex gap-3 ${msg.sender_type === 'ceo' ? 'flex-row-reverse' : ''}`}>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
            msg.sender_type === 'ceo'
              ? 'bg-[#6366f1]/20 text-[#818cf8] border border-[#6366f1]/30'
              : 'bg-[#12121a] text-[#6b7280] border border-[#1e1e2e]'
          }`}>
            {msg.sender_type === 'ceo' ? <UserIcon /> : <BotIcon />}
          </div>
          <div className={`max-w-lg flex flex-col gap-1 ${msg.sender_type === 'ceo' ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-center gap-2 text-[11px] text-[#374151] ${msg.sender_type === 'ceo' ? 'flex-row-reverse' : ''}`}>
              <span className="font-semibold text-[#6b7280]">{msg.sender_name}</span>
              <span>{formatTime(msg.created_at)}</span>
            </div>
            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              msg.sender_type === 'ceo'
                ? 'bg-[#6366f1]/12 text-white border border-[#6366f1]/25 rounded-tr-sm'
                : 'bg-[#0d0d15] text-[#d1d5db] border border-[#1e1e2e] rounded-tl-sm'
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
