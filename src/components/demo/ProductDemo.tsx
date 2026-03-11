'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface ChatMessage {
  id: string
  content: string
  sender_name: string
  created_at: string
}

const ExternalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
)
const RefreshIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
)
const CodeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
)

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`
}

export function ProductDemo() {
  const [url, setUrl] = useState('')
  const [inputUrl, setInputUrl] = useState('')
  const [iframeKey, setIframeKey] = useState(0)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loadingMsgs, setLoadingMsgs] = useState(true)
  const supabase = createClient()

  // Load saved URL from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sangam_demo_url') ?? ''
    setUrl(saved)
    setInputUrl(saved)
  }, [])

  const fetchMessages = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: customer } = await supabase.from('customers').select('id').eq('user_id', user.id).single()
    if (!customer) return

    // Get Engineering + Product channels
    const { data: channels } = await supabase
      .from('chat_channels')
      .select('id')
      .eq('customer_id', customer.id)
      .in('department', ['engineering', 'product'])

    if (!channels?.length) { setLoadingMsgs(false); return }

    const channelIds = channels.map((c: { id: string }) => c.id)
    const { data: msgs } = await supabase
      .from('chat_messages')
      .select('id, content, sender_name, created_at')
      .in('channel_id', channelIds)
      .eq('sender_type', 'agent')
      .order('created_at', { ascending: false })
      .limit(10)

    setMessages((msgs ?? []) as ChatMessage[])
    setLoadingMsgs(false)
  }, [supabase])

  useEffect(() => { fetchMessages() }, [fetchMessages])

  function applyUrl() {
    const clean = inputUrl.trim()
    if (clean) {
      setUrl(clean)
      localStorage.setItem('sangam_demo_url', clean)
      setIframeKey(k => k + 1)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') applyUrl()
  }

  const agentColor = (name: string) => {
    if (name.toLowerCase().includes('engineer')) return '#4ade80'
    if (name.toLowerCase().includes('product')) return '#38bdf8'
    return '#a78bfa'
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* URL bar */}
      <div className="flex gap-3 mb-6 items-center">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{ background: '#0b1018', border: '1px solid #1a2236' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4a566e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <input
            type="url"
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste your product URL to preview it here\u2026"
            className="flex-1 bg-transparent outline-none text-[13px]"
            style={{ color: '#eef2f8', minWidth: 0 }}
          />
        </div>
        <button onClick={applyUrl}
          className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white cursor-pointer transition-all"
          style={{ background: '#7c3aed', border: 'none', boxShadow: '0 0 16px rgba(124,58,237,0.35)', flexShrink: 0 }}>
          Preview
        </button>
        {url && (
          <button onClick={() => setIframeKey(k => k + 1)}
            className="p-2.5 rounded-xl transition-all cursor-pointer"
            style={{ background: '#101620', border: '1px solid #1a2236', color: '#8b98b4' }}
            title="Reload">
            <RefreshIcon />
          </button>
        )}
      </div>

      {/* Main layout */}
      <div className="flex gap-5" style={{ height: 'calc(100vh - 14rem)' }}>
        {/* iframe preview */}
        <div className="flex-1 flex flex-col rounded-2xl overflow-hidden"
          style={{ background: '#0b1018', border: '1px solid #1a2236' }}>
          {/* Browser chrome */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid #1a2236', background: '#101620' }}>
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f43f5e' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#22c55e' }} />
              </div>
            </div>
            <div className="flex-1 mx-4 px-3 py-1 rounded-lg text-[11px] text-center truncate"
              style={{ background: '#0b1018', border: '1px solid #1a2236', color: '#4a566e' }}>
              {url || 'No URL set'}
            </div>
            {url && (
              <a href={url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] cursor-pointer transition-colors"
                style={{ color: '#4a566e', flexShrink: 0 }}>
                <ExternalIcon /> Open
              </a>
            )}
          </div>

          {/* iframe or empty state */}
          <div className="flex-1 relative">
            {url ? (
              <iframe
                key={iframeKey}
                src={url}
                title="Product Preview"
                className="absolute inset-0 w-full h-full"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                style={{ border: 'none' }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(167,139,250,0.15)', color: '#a78bfa' }}>
                  <CodeIcon />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-[16px] mb-2"
                    style={{ fontFamily: 'var(--font-bricolage)', color: '#eef2f8' }}>
                    Preview your product here
                  </h3>
                  <p className="text-[13px] max-w-xs leading-relaxed mb-1" style={{ color: '#8b98b4' }}>
                    Paste any URL in the bar above — your live site, staging environment, or Vercel preview.
                  </p>
                  <p className="text-[12px] max-w-xs leading-relaxed" style={{ color: '#4a566e' }}>
                    Check the Agent Notes panel for the latest build updates from your Engineering team.
                  </p>
                </div>
                <Link href="/dashboard/chat"
                  className="text-[12px] font-medium transition-colors"
                  style={{ color: '#7c3aed' }}>
                  View engineering updates \u2192
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Agent build updates panel */}
        <div className="w-72 flex-shrink-0 flex flex-col rounded-2xl overflow-hidden"
          style={{ background: '#0b1018', border: '1px solid #1a2236' }}>
          <div className="px-4 py-3.5 flex-shrink-0"
            style={{ borderBottom: '1px solid #1a2236' }}>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.12em]"
              style={{ color: '#4a566e', fontFamily: 'var(--font-bricolage)' }}>
              Agent Notes
            </h3>
            <p className="text-[11px] mt-0.5" style={{ color: '#2e3b52' }}>Latest from Engineering &amp; Product</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {loadingMsgs ? (
              <p className="text-[12px] text-center py-8" style={{ color: '#4a566e' }}>Loading\u2026</p>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[12px] font-semibold mb-1" style={{ color: '#4a566e' }}>No updates yet</p>
                <p className="text-[11px]" style={{ color: '#2e3b52' }}>Agent build updates appear here.</p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="rounded-xl px-3 py-2.5"
                  style={{ background: '#101620', border: '1px solid #1a2236' }}>
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <span className="text-[11px] font-semibold"
                      style={{ color: agentColor(msg.sender_name), fontFamily: 'var(--font-bricolage)' }}>
                      {msg.sender_name}
                    </span>
                    <span className="text-[10px]" style={{ color: '#2e3b52' }}>{timeAgo(msg.created_at)}</span>
                  </div>
                  <p className="text-[12px] leading-relaxed line-clamp-4" style={{ color: '#8b98b4' }}>
                    {msg.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
