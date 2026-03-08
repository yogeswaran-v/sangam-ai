'use client'

import { useState } from 'react'

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
      <div className="flex items-end gap-3 bg-[#12121a] border border-[#1e1e2e] rounded-xl px-4 py-3 focus-within:border-[#6366f1] transition-colors">
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message your agents... (Enter to send)"
          rows={1}
          disabled={disabled || sending}
          className="flex-1 bg-transparent text-white placeholder-[#4b5563] outline-none text-sm resize-none leading-relaxed"
          style={{ minHeight: '24px', maxHeight: '120px' }}
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || sending || disabled}
          className="px-4 py-1.5 bg-[#6366f1] text-white rounded-lg text-sm hover:bg-[#818cf8] transition-colors disabled:opacity-50 flex-shrink-0"
        >
          {sending ? '...' : 'Send'}
        </button>
      </div>
      <p className="text-[#4b5563] text-xs mt-2 px-1">Shift+Enter for new line</p>
    </div>
  )
}
