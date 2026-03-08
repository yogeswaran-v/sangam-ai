'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AgentPixel, AgentEvent } from '@/types/pixel'
import { AgentSprite } from './AgentSprite'
import { ActivityFeed } from './ActivityFeed'

const AGENT_DEFAULTS: AgentPixel[] = [
  { id: 'ceo', name: 'CEO Agent', emoji: '👑', color: '#6366f1', status: 'idle', x: 20, y: 30 },
  { id: 'product', name: 'Product Agent', emoji: '📋', color: '#f59e0b', status: 'idle', x: 40, y: 20 },
  { id: 'engineering', name: 'Engineer Agent', emoji: '⚙️', color: '#3b82f6', status: 'idle', x: 60, y: 35 },
  { id: 'marketing', name: 'Marketing Agent', emoji: '📣', color: '#ec4899', status: 'idle', x: 30, y: 60 },
  { id: 'sales', name: 'Sales Agent', emoji: '💼', color: '#10b981', status: 'idle', x: 70, y: 55 },
  { id: 'finance', name: 'Finance Agent', emoji: '📊', color: '#f97316', status: 'idle', x: 50, y: 70 },
]

function agentNameToId(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('ceo')) return 'ceo'
  if (lower.includes('product')) return 'product'
  if (lower.includes('engineer')) return 'engineering'
  if (lower.includes('market')) return 'marketing'
  if (lower.includes('sales')) return 'sales'
  if (lower.includes('finance')) return 'finance'
  return 'ceo'
}

export function PixelWorld() {
  const [agents, setAgents] = useState<AgentPixel[]>(AGENT_DEFAULTS)
  const [events, setEvents] = useState<AgentEvent[]>([])
  const supabase = createClient()

  const fetchRecentEvents = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!customer) return

    const { data } = await supabase
      .from('agent_events')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(20)

    const evts = (data ?? []) as AgentEvent[]
    setEvents(evts)

    // Update agent statuses based on recent events
    if (evts.length > 0) {
      const recentByAgent: Record<string, AgentEvent> = {}
      evts.forEach(e => {
        if (!recentByAgent[e.agent_name]) recentByAgent[e.agent_name] = e
      })
      setAgents(prev => prev.map(a => {
        const agentEvent = Object.values(recentByAgent).find(
          e => agentNameToId(e.agent_name) === a.id
        )
        if (!agentEvent) return a
        const ageMs = Date.now() - new Date(agentEvent.created_at).getTime()
        const status = ageMs < 300_000 ? 'working' : 'idle'
        return { ...a, status, currentTask: agentEvent.event_type }
      }))
    }
  }, [supabase])

  useEffect(() => {
    fetchRecentEvents()
  }, [fetchRecentEvents])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('agent_events_live')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'agent_events',
      }, payload => {
        const evt = payload.new as AgentEvent
        setEvents(prev => [evt, ...prev].slice(0, 20))
        setAgents(prev => prev.map(a => {
          if (agentNameToId(evt.agent_name) === a.id) {
            return { ...a, status: 'working', currentTask: evt.event_type }
          }
          return a
        }))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  return (
    <div className="flex h-[calc(100vh-8rem)] border border-[#1e1e2e] rounded-2xl overflow-hidden">
      {/* Canvas */}
      <div className="flex-1 relative bg-[#0a0a0f] overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(to right, #6366f1 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Corner labels */}
        <div className="absolute top-3 left-3 text-xs text-[#4b5563]">Operations Floor</div>
        <div className="absolute bottom-3 right-3 text-xs text-[#4b5563]">Sangam HQ</div>

        {/* Agent sprites */}
        {agents.map(agent => (
          <AgentSprite key={agent.id} agent={agent} />
        ))}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex items-center gap-4 text-xs text-[#6b7280]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4b5563]" /> Idle
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#6366f1] animate-pulse" /> Working
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" /> Complete
          </div>
        </div>
      </div>

      {/* Activity feed */}
      <ActivityFeed events={events} />
    </div>
  )
}
