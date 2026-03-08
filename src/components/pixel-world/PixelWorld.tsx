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
      <div className="flex-1 relative bg-[#0d0d18] overflow-hidden">
        {/* Grid floor */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(to right, rgba(99,102,241,0.08) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Ambient glow spots */}
        <div className="absolute top-[-10%] left-[20%] w-64 h-64 rounded-full bg-[#6366f1]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[30%] w-48 h-48 rounded-full bg-[#3b82f6]/5 blur-3xl pointer-events-none" />

        {/* Department zone labels */}
        <div className="absolute top-4 left-4 text-[10px] text-[#6366f1]/40 uppercase tracking-widest font-mono">Leadership</div>
        <div className="absolute top-4 right-36 text-[10px] text-[#3b82f6]/40 uppercase tracking-widest font-mono">Engineering</div>
        <div className="absolute bottom-16 left-4 text-[10px] text-[#ec4899]/40 uppercase tracking-widest font-mono">Marketing</div>
        <div className="absolute bottom-16 right-36 text-[10px] text-[#10b981]/40 uppercase tracking-widest font-mono">Sales</div>

        {/* Desks — pixel art style divs */}
        {/* CEO desk */}
        <div className="absolute" style={{ left: '16%', top: '22%' }}>
          <div className="w-14 h-8 bg-[#1e1e2e] border border-[#6366f1]/30 rounded-sm" />
          <div className="w-8 h-1 bg-[#6366f1]/20 rounded mt-0.5 mx-auto" />
        </div>
        {/* Product desk */}
        <div className="absolute" style={{ left: '36%', top: '12%' }}>
          <div className="w-14 h-8 bg-[#1e1e2e] border border-[#f59e0b]/30 rounded-sm" />
          <div className="w-8 h-1 bg-[#f59e0b]/20 rounded mt-0.5 mx-auto" />
        </div>
        {/* Engineering desk */}
        <div className="absolute" style={{ left: '56%', top: '26%' }}>
          <div className="w-14 h-8 bg-[#1e1e2e] border border-[#3b82f6]/30 rounded-sm" />
          <div className="w-8 h-1 bg-[#3b82f6]/20 rounded mt-0.5 mx-auto" />
        </div>
        {/* Marketing desk */}
        <div className="absolute" style={{ left: '22%', top: '58%' }}>
          <div className="w-14 h-8 bg-[#1e1e2e] border border-[#ec4899]/30 rounded-sm" />
          <div className="w-8 h-1 bg-[#ec4899]/20 rounded mt-0.5 mx-auto" />
        </div>
        {/* Sales desk */}
        <div className="absolute" style={{ left: '64%', top: '52%' }}>
          <div className="w-14 h-8 bg-[#1e1e2e] border border-[#10b981]/30 rounded-sm" />
          <div className="w-8 h-1 bg-[#10b981]/20 rounded mt-0.5 mx-auto" />
        </div>
        {/* Finance desk */}
        <div className="absolute" style={{ left: '44%', top: '68%' }}>
          <div className="w-14 h-8 bg-[#1e1e2e] border border-[#f97316]/30 rounded-sm" />
          <div className="w-8 h-1 bg-[#f97316]/20 rounded mt-0.5 mx-auto" />
        </div>

        {/* Meeting table in center */}
        <div className="absolute" style={{ left: '42%', top: '40%', transform: 'translate(-50%, -50%)' }}>
          <div className="w-20 h-12 bg-[#12121a] border border-[#1e1e2e] rounded-lg flex items-center justify-center">
            <span className="text-[8px] text-[#4b5563] uppercase tracking-widest">HQ</span>
          </div>
        </div>

        {/* Corner labels */}
        <div className="absolute bottom-3 right-3 text-[10px] text-[#4b5563] font-mono">Sangam HQ v0.1</div>

        {/* Agent sprites */}
        {agents.map(agent => (
          <AgentSprite key={agent.id} agent={agent} />
        ))}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex items-center gap-4 text-[10px] text-[#6b7280]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4b5563]" /> Idle
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#6366f1] animate-pulse" /> Working
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" /> Done
          </div>
        </div>
      </div>

      {/* Activity feed */}
      <ActivityFeed events={events} />
    </div>
  )
}
