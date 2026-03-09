'use client'

import { useState } from 'react'

const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

interface Props {
  onSend: (content: string) => Promise<void>
  disabled?: boolean
}

export function MessageInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSend() {
    if (!value.trim() || sending) return
    setSending(true)
    await onSend(value.trim())
    setValue('')
    setSending(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="p-4 border-t border-[#1e1e2e]">
      <div className="flex items-end gap-3 bg-[#0d0d15] border border-[#1e1e2e] rounded-xl px-4 py-3 focus-within:border-[#6366f1]/50 focus-within:shadow-[0_0_0_1px_rgba(99,102,241,0.15)] transition-all duration-200">
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message your agents... (Enter to send)"
          rows={1}
          disabled={disabled || sending}
          className="flex-1 bg-transparent text-white placeholder-[#374151] outline-none text-sm resize-none leading-relaxed"
          style={{ minHeight: '24px', maxHeight: '120px' }}
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || sending || disabled}
          aria-label="Send message"
          className="p-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#818cf8] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 cursor-pointer shadow-[0_0_8px_rgba(99,102,241,0.3)]"
        >
          <SendIcon />
        </button>
      </div>
      <p className="text-[#374151] text-[11px] mt-1.5 px-1">Shift+Enter for new line</p>
    </div>
  )
}
