'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ChatChannel, ChatMessage } from '@/types/chat'
import { ChannelList } from './ChannelList'
import { MessageFeed } from './MessageFeed'
import { MessageInput } from './MessageInput'

export function ChatInterface() {
  const [channels, setChannels] = useState<ChatChannel[]>([])
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loadingChannels, setLoadingChannels] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [customer, setCustomer] = useState<{ id: string } | null>(null)
  const supabase = createClient()

  const fetchChannels = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!customer) { setLoadingChannels(false); return }

    setCustomer(customer)

    const { data } = await supabase
      .from('chat_channels')
      .select('*')
      .eq('customer_id', customer.id)
      .order('name')

    const chs = (data ?? []) as ChatChannel[]
    setChannels(chs)
    setActiveChannelId(prev => {
      if (prev) return prev
      return chs.length > 0 ? chs[0].id : null
    })
    setLoadingChannels(false)
  }, [supabase])

  const fetchMessages = useCallback(async (channelId: string) => {
    setLoadingMessages(true)
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .limit(100)

    setMessages((data ?? []) as ChatMessage[])
    setLoadingMessages(false)
  }, [supabase])

  useEffect(() => { fetchChannels() }, [fetchChannels])

  useEffect(() => {
    if (activeChannelId) fetchMessages(activeChannelId)
  }, [activeChannelId, fetchMessages])

  // Real-time subscription
  useEffect(() => {
    if (!activeChannelId) return
    const channel = supabase
      .channel(`chat_${activeChannelId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `channel_id=eq.${activeChannelId}`,
      }, payload => {
        const incoming = payload.new as ChatMessage
        setMessages(prev => {
          // Replace matching temp message or just append
          const withoutTemp = prev.filter(m => !(m.id.startsWith('temp-') && m.content === incoming.content && m.sender_type === incoming.sender_type))
          return [...withoutTemp, incoming]
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeChannelId, supabase])

  async function handleSend(content: string) {
    if (!activeChannelId) return
    // Optimistic: show message immediately
    const tempId = `temp-${Date.now()}`
    const optimistic: ChatMessage = {
      id: tempId,
      channel_id: activeChannelId,
      sender_name: 'You (CEO)',
      sender_type: 'ceo',
      content,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])
    // Insert to DB
    await supabase.from('chat_messages').insert({
      channel_id: activeChannelId,
      sender_name: 'You (CEO)',
      sender_type: 'ceo',
      content,
    })
    // Trigger agent response
    if (customer?.id) {
      fetch('/api/chat/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: activeChannelId, customerId: customer.id, userMessage: content }),
      }).catch(() => null) // fire and forget
    }
  }

  async function clearChannel() {
    if (!activeChannelId) return
    if (!window.confirm('Clear all messages in this channel?')) return
    await supabase.from('chat_messages').delete().eq('channel_id', activeChannelId)
    setMessages([])
  }

  const activeChannel = channels.find(c => c.id === activeChannelId)

  if (loadingChannels) {
    return <div className="flex-1 flex items-center justify-center text-[#6b7280]">Loading...</div>
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] border border-[#1e1e2e] rounded-2xl overflow-hidden bg-[#0a0a0f]">
      <ChannelList
        channels={channels}
        activeChannelId={activeChannelId}
        onSelect={id => setActiveChannelId(id)}
      />
      <div className="flex-1 flex flex-col">
        {activeChannel && (
          <div className="px-6 py-4 border-b border-[#1e1e2e] flex items-center gap-3">
            <h3 className="text-sm font-semibold text-white">{activeChannel.name}</h3>
            <span className="text-xs text-[#4b5563]">#{activeChannel.department}</span>
            <button onClick={clearChannel}
              style={{ marginLeft: 'auto', fontSize: 11, color: '#4a566e', background: 'transparent', border: '1px solid #1a2236', borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}>
              Clear
            </button>
          </div>
        )}
        <MessageFeed messages={messages} loading={loadingMessages} />
        <MessageInput onSend={handleSend} disabled={!activeChannelId} />
      </div>
    </div>
  )
}
