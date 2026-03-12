'use client'

import { useEffect, useState } from 'react'
import { AgentSprite } from '@/components/pixel-world/AgentSprite'
import type { AgentPixel, AgentEvent } from '@/types/pixel'

/* ─── Mock data ─── */

const AGENT_COLORS: Record<string, string> = {
  ceo: '#a78bfa', product: '#38bdf8', engineering: '#4ade80',
  marketing: '#fb923c', sales: '#f472b6', finance: '#14b8a6',
}

const HOME: Record<string, { x: number; y: number }> = {
  ceo:         { x: 12, y: 25 },
  product:     { x: 40, y: 16 },
  engineering: { x: 68, y: 22 },
  marketing:   { x: 12, y: 64 },
  sales:       { x: 70, y: 61 },
  finance:     { x: 44, y: 74 },
}

const ZONES = [
  { x: 44, y: 46 }, // meeting
  { x: 54, y: 10 }, // whiteboard
  { x: 80, y: 10 }, // server
  { x: 84, y: 55 }, // coffee
]

const TASKS = ['strategy_planning', 'code_review', 'content_creation', 'team_sync', 'finance_review', 'sales_outreach', 'kanban_update']

const INITIAL_AGENTS: AgentPixel[] = [
  { id: 'ceo',         name: 'CEO',         emoji: '👔', color: AGENT_COLORS.ceo,         status: 'working', currentTask: 'strategy_planning', ...HOME.ceo },
  { id: 'product',     name: 'Product',     emoji: '📋', color: AGENT_COLORS.product,     status: 'working', currentTask: 'kanban_update',      ...HOME.product },
  { id: 'engineering', name: 'Engineer',    emoji: '⚙️', color: AGENT_COLORS.engineering, status: 'working', currentTask: 'code_review',        ...HOME.engineering },
  { id: 'marketing',   name: 'Marketing',   emoji: '📣', color: AGENT_COLORS.marketing,   status: 'idle',    currentTask: undefined,             ...HOME.marketing },
  { id: 'sales',       name: 'Sales',       emoji: '🤝', color: AGENT_COLORS.sales,       status: 'working', currentTask: 'sales_outreach',      ...HOME.sales },
  { id: 'finance',     name: 'Finance',     emoji: '💰', color: AGENT_COLORS.finance,     status: 'idle',    currentTask: undefined,             ...HOME.finance },
]

const MOCK_EVENTS: AgentEvent[] = [
  { id: '1', agent_name: 'CEO Agent',         event_type: 'strategy_planning', payload: null, created_at: new Date(Date.now() - 120000).toISOString() },
  { id: '2', agent_name: 'Engineer Agent',    event_type: 'code_review',       payload: null, created_at: new Date(Date.now() - 240000).toISOString() },
  { id: '3', agent_name: 'Product Agent',     event_type: 'kanban_update',     payload: null, created_at: new Date(Date.now() - 360000).toISOString() },
  { id: '4', agent_name: 'Sales Agent',       event_type: 'sales_outreach',    payload: null, created_at: new Date(Date.now() - 480000).toISOString() },
  { id: '5', agent_name: 'Marketing Agent',   event_type: 'content_creation',  payload: null, created_at: new Date(Date.now() - 600000).toISOString() },
]

const MOCK_MESSAGES = [
  { id: '1', sender_name: 'CEO Agent',      sender_type: 'ceo',         content: 'I\'ve reviewed the Q2 roadmap. Prioritising user retention features over new acquisition this quarter. Engineering, please align the sprint.',         created_at: new Date(Date.now() - 600000).toISOString() },
  { id: '2', sender_name: 'You',            sender_type: 'user',        content: 'Makes sense. What\'s the revenue impact estimate?',                                                                                                         created_at: new Date(Date.now() - 540000).toISOString() },
  { id: '3', sender_name: 'Finance Agent',  sender_type: 'finance',     content: 'Based on current churn data, improving retention by 5% adds approximately ₹8.2L/month to ARR. I\'ve updated the P&L model with three scenarios.',          created_at: new Date(Date.now() - 480000).toISOString() },
  { id: '4', sender_name: 'Product Agent',  sender_type: 'product',     content: 'Sprint plan updated. Pushed the new integrations to next quarter. Backlog re-prioritised — 3 retention tickets moved to top of queue.',                     created_at: new Date(Date.now() - 300000).toISOString() },
  { id: '5', sender_name: 'Engineer Agent', sender_type: 'engineering', content: 'On it. I\'ve opened a draft PR for the session persistence fix. Should be ready for review by EOD. One question — should I add analytics events too?',       created_at: new Date(Date.now() - 180000).toISOString() },
  { id: '6', sender_name: 'You',            sender_type: 'user',        content: 'Yes, add analytics. Also — Marketing, can you run a re-engagement campaign for users who churned in the last 30 days?',                                     created_at: new Date(Date.now() - 120000).toISOString() },
  { id: '7', sender_name: 'Marketing Agent',sender_type: 'marketing',   content: 'On it. Drafting a 3-email sequence targeting the 847 users who churned in Feb. Subject line options ready for your review by tomorrow morning.',             created_at: new Date(Date.now() - 60000).toISOString() },
]

/* ─── Pixel World (animated, no Supabase) ─── */

function MockPixelWorld() {
  const [agents, setAgents] = useState<AgentPixel[]>(INITIAL_AGENTS)

  useEffect(() => {
    const tick = () => {
      setAgents(prev => prev.map(agent => {
        if (Math.random() < 0.35) {
          const goHome = Math.random() < 0.4
          const pos = goHome
            ? HOME[agent.id]
            : ZONES[Math.floor(Math.random() * ZONES.length)]
          const isWorking = Math.random() > 0.25
          return {
            ...agent,
            ...pos,
            status: isWorking ? 'working' : 'idle',
            currentTask: isWorking ? TASKS[Math.floor(Math.random() * TASKS.length)] : undefined,
          }
        }
        return agent
      }))
    }

    const interval = setInterval(tick, 2200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      id="pixel-world"
      className="relative w-full rounded-2xl overflow-hidden"
      style={{ height: 520, background: '#05080f', border: '1px solid #1a2236' }}
    >
      {/* Floor grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(167,139,250,1) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,1) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Zone labels */}
      {[
        { label: 'Meeting Room',  x: '37%', y: '40%' },
        { label: 'Whiteboard',    x: '47%', y:  '4%' },
        { label: 'Server Room',   x: '72%', y:  '4%' },
        { label: 'Coffee Corner', x: '76%', y: '49%' },
      ].map(z => (
        <div key={z.label} className="absolute text-[10px] font-bold uppercase tracking-widest pointer-events-none"
          style={{ left: z.x, top: z.y, color: '#1a2236', transform: 'translateX(-50%)' }}>
          {z.label}
        </div>
      ))}

      {/* Zone circles */}
      {ZONES.map((z, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none"
          style={{
            left: `${z.x}%`, top: `${z.y}%`,
            width: 70, height: 70,
            transform: 'translate(-50%, -50%)',
            background: 'rgba(124,58,237,0.04)',
            border: '1px solid rgba(124,58,237,0.1)',
          }} />
      ))}

      {/* Agents */}
      {agents.map(agent => (
        <AgentSprite key={agent.id} agent={agent} />
      ))}

      {/* Activity feed overlay */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5" style={{ maxWidth: 260 }}>
        {MOCK_EVENTS.slice(0, 4).map(e => (
          <div key={e.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium"
            style={{ background: 'rgba(5,8,15,0.85)', border: '1px solid #1a2236', color: '#4a566e' }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: AGENT_COLORS[e.agent_name.toLowerCase().split(' ')[0]] ?? '#7c3aed' }} />
            <span className="text-[#8b98b4] font-semibold">{e.agent_name.replace(' Agent', '')}</span>
            <span>{e.event_type.replace(/_/g, ' ')}</span>
          </div>
        ))}
      </div>

      {/* Title */}
      <div className="absolute top-4 right-4 text-[11px] font-bold uppercase tracking-[0.15em] text-[#2e3b52]">
        Live · Pixel World
      </div>
    </div>
  )
}

/* ─── Mock Chat ─── */

function MockChat() {
  const agentColors: Record<string, string> = {
    ceo: '#a78bfa', engineering: '#4ade80', product: '#38bdf8',
    marketing: '#fb923c', finance: '#14b8a6', sales: '#f472b6',
  }

  return (
    <div id="chat" className="rounded-2xl overflow-hidden flex" style={{ height: 520, background: '#0b1018', border: '1px solid #1a2236' }}>
      {/* Sidebar */}
      <div className="flex flex-col" style={{ width: 220, background: '#05080f', borderRight: '1px solid #1a2236' }}>
        <div className="p-4 border-b border-[#1a2236]">
          <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#4a566e]">Channels</div>
        </div>
        {['CEO', 'Product', 'Engineering', 'Marketing', 'Sales', 'Finance'].map((name, i) => {
          const id = name.toLowerCase()
          const color = agentColors[id] ?? '#a78bfa'
          return (
            <div key={name} className="flex items-center gap-3 px-4 py-3 cursor-default"
              style={i === 0 ? { background: 'rgba(124,58,237,0.08)', borderLeft: '2px solid #7c3aed' } : {}}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
                {name[0]}
              </div>
              <div className="text-[13px] font-medium" style={{ color: i === 0 ? '#eef2f8' : '#4a566e' }}>{name}</div>
              {i === 0 && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#7c3aed' }} />}
            </div>
          )
        })}
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-[#1a2236] flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold"
            style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa' }}>C</div>
          <div>
            <div className="text-[13px] font-bold text-[#eef2f8]">CEO</div>
            <div className="text-[10px] text-[#4a566e]">Strategy · Vision · Decisions</div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-[#4ade80]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
            Working
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
          {MOCK_MESSAGES.map(msg => {
            const isUser = msg.sender_type === 'user'
            const agentId = msg.sender_type
            const color = agentColors[agentId] ?? '#a78bfa'
            return (
              <div key={msg.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5"
                    style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
                    {msg.sender_name[0]}
                  </div>
                )}
                <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : ''}`} style={{ maxWidth: '72%' }}>
                  {!isUser && (
                    <div className="text-[11px] font-semibold" style={{ color }}>{msg.sender_name}</div>
                  )}
                  <div className="px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed"
                    style={isUser
                      ? { background: '#7c3aed', color: 'white', borderBottomRightRadius: 4 }
                      : { background: '#101620', color: '#8b98b4', border: '1px solid #1a2236', borderBottomLeftRadius: 4 }
                    }>
                    {msg.content}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="p-4 border-t border-[#1a2236]">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] text-[#2e3b52]"
            style={{ background: '#05080f', border: '1px solid #1a2236' }}>
            Message your CEO agent...
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Mock Dashboard ─── */

function MockDashboard() {
  const stats = [
    { label: 'Tasks Completed',  value: '247',  delta: '+12 today',  color: '#4ade80' },
    { label: 'Active Agents',    value: '4/6',  delta: '2 on standby', color: '#a78bfa' },
    { label: 'Pending Approvals',value: '3',    delta: 'Needs review', color: '#fb923c' },
    { label: 'Monthly Tokens',   value: '312K', delta: '62% of plan',  color: '#38bdf8' },
  ]

  return (
    <div id="dashboard" className="flex flex-col gap-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="p-5 rounded-2xl" style={{ background: '#0b1018', border: '1px solid #1a2236' }}>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#4a566e] mb-2">{s.label}</div>
            <div className="text-3xl font-extrabold text-[#eef2f8] mb-1" style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>{s.value}</div>
            <div className="text-[12px] font-semibold" style={{ color: s.color }}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Mission Brief */}
      <div className="p-7 rounded-2xl" style={{ background: '#0b1018', border: '1px solid #1a2236' }}>
        <div className="flex items-center gap-3 mb-6">
          <span className="w-px h-4 rounded-full" style={{ background: '#7c3aed' }} />
          <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#eef2f8]">Mission Brief</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Vision',   value: 'Build the default AI operating system for early-stage startups. Replace the entire ops layer with an autonomous agent team.' },
            { label: 'Product',  value: 'Multi-agent SaaS platform — CEO, Product, Engineering, Marketing, Sales, Finance agents working in concert.' },
            { label: 'Goals',    value: '₹50L ARR by December 2026. 200 paying teams. Sub-2% monthly churn.' },
            { label: 'Timeline', value: 'Public beta by June 2026. Paid plans live by August. Series A conversations by Q4.' },
          ].map(f => (
            <div key={f.label} className="rounded-xl p-4" style={{ background: '#101620', border: '1px solid #1a2236' }}>
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: '#4a566e' }}>{f.label}</div>
              <p className="text-[13px] leading-relaxed" style={{ color: '#8b98b4' }}>{f.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Approvals Mock ─── */

function MockApprovals() {
  return (
    <div id="approvals" className="flex flex-col gap-4">
      {[
        {
          agent: 'Marketing Agent', color: '#fb923c',
          title: 'Launch re-engagement email campaign',
          desc: 'Send a 3-email sequence to 847 churned users from February. Estimated cost: ₹0 (using existing Mailchimp plan). Expected recovery rate: 6-8%.',
          urgency: 'High',
        },
        {
          agent: 'Engineer Agent', color: '#4ade80',
          title: 'Merge PR #47 — session persistence fix',
          desc: 'Fixes the logout-on-refresh bug affecting 12% of sessions. All tests passing. Ready to deploy to production.',
          urgency: 'Medium',
        },
        {
          agent: 'Finance Agent', color: '#14b8a6',
          title: 'Approve ₹15,000 Notion Teams subscription',
          desc: 'Current free plan limits collaboration. Team plan enables unlimited blocks and API access needed for the product wiki.',
          urgency: 'Low',
        },
      ].map(item => (
        <div key={item.title} className="p-6 rounded-2xl flex gap-5" style={{ background: '#0b1018', border: '1px solid #1a2236' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold flex-shrink-0"
            style={{ background: `${item.color}15`, border: `1px solid ${item.color}30`, color: item.color }}>
            {item.agent[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="text-[14px] font-bold text-[#eef2f8]">{item.title}</div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide flex-shrink-0"
                style={{ background: `${item.color}15`, color: item.color }}>{item.urgency}</span>
            </div>
            <p className="text-[13px] text-[#4a566e] leading-relaxed mb-4">{item.desc}</p>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 rounded-lg text-[13px] font-semibold text-white"
                style={{ background: '#7c3aed' }}>Approve</button>
              <button className="px-4 py-1.5 rounded-lg text-[13px] font-medium text-[#4a566e]"
                style={{ border: '1px solid #1a2236' }}>Reject</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Page ─── */

export default function ScreenshotDemoPage() {
  return (
    <div style={{ background: '#05080f', minHeight: '100vh', padding: '40px' }} className="text-[#eef2f8]">

      {/* Section: Pixel World */}
      <div id="section-pixel" style={{ marginBottom: 80 }}>
        <MockPixelWorld />
      </div>

      {/* Section: Dashboard */}
      <div id="section-dashboard" style={{ marginBottom: 80 }}>
        <MockDashboard />
      </div>

      {/* Section: Chat */}
      <div id="section-chat" style={{ marginBottom: 80 }}>
        <MockChat />
      </div>

      {/* Section: Approvals */}
      <div id="section-approvals" style={{ marginBottom: 80 }}>
        <MockApprovals />
      </div>

    </div>
  )
}
