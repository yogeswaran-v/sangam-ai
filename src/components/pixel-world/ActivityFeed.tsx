import type { AgentEvent, AgentPixel } from '@/types/pixel'

interface Props {
  events: AgentEvent[]
  agents?: AgentPixel[]
}

function agentNameToId(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('ceo'))      return 'ceo'
  if (n.includes('product'))  return 'product'
  if (n.includes('engineer')) return 'engineering'
  if (n.includes('market'))   return 'marketing'
  if (n.includes('sales'))    return 'sales'
  if (n.includes('finance'))  return 'finance'
  return 'ceo'
}

const AGENT_COLORS: Record<string, string> = {
  ceo: '#a78bfa',
  product: '#38bdf8',
  engineering: '#4ade80',
  marketing: '#fb923c',
  sales: '#f472b6',
  finance: '#14b8a6',
}

const EVENT_DESCRIPTIONS: Record<string, { label: string; icon: string }> = {
  kanban_update:    { label: 'Updating kanban board',     icon: '⬡' },
  code_review:      { label: 'Writing / reviewing code',  icon: '⌥' },
  content_creation: { label: 'Creating content',          icon: '✦' },
  strategy_planning:{ label: 'Planning strategy',         icon: '◈' },
  finance_review:   { label: 'Reviewing financials',      icon: '◆' },
  sales_outreach:   { label: 'Running sales outreach',    icon: '◉' },
  team_sync:        { label: 'Team sync / meeting',       icon: '◎' },
  marketing_work:   { label: 'Running marketing ops',     icon: '◐' },
  approval_request: { label: 'Requesting approval',       icon: '◇' },
  infra_work:       { label: 'Infrastructure work',       icon: '⬢' },
  agent_work:       { label: 'Working on mission',        icon: '◌' },
  message:          { label: 'Agent message sent',        icon: '◌' },
}

function getEventMeta(eventType: string): { label: string; icon: string } {
  return EVENT_DESCRIPTIONS[eventType] ?? { label: eventType.split('_').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' '), icon: '◌' }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function ActivityFeed({ events, agents }: Props) {
  // Find live (working) agents for the status section
  const workingAgents = (agents ?? []).filter(a => a.status === 'working')

  return (
    <div className="w-72 flex-shrink-0 flex flex-col" style={{ borderLeft: '1px solid #1a2236' }}>
      {/* Header */}
      <div className="px-4 py-3.5 flex-shrink-0" style={{ borderBottom: '1px solid #1a2236' }}>
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: '#4a566e', fontFamily: 'var(--font-bricolage)' }}>
            Live Activity
          </h3>
          {workingAgents.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: '#4ade80' }}>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-60" />
                <span className="relative block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              {workingAgents.length} active
            </div>
          )}
        </div>
      </div>

      {/* Active agents quick view */}
      {workingAgents.length > 0 && (
        <div className="px-3 py-3 flex-shrink-0" style={{ borderBottom: '1px solid #1a2236' }}>
          <div className="flex flex-wrap gap-1.5">
            {workingAgents.map(a => (
              <div key={a.id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold"
                style={{ background: `${a.color}10`, border: `1px solid ${a.color}25`, color: a.color }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: a.color }} />
                {a.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event list */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {events.length === 0 && (
          <div className="px-2 py-8 text-center">
            <div className="text-[11px] font-semibold mb-1" style={{ color: '#4a566e', fontFamily: 'var(--font-bricolage)' }}>
              No activity yet
            </div>
            <p className="text-[11px]" style={{ color: '#2e3b52' }}>
              Waiting for agents to start working on your mission.
            </p>
          </div>
        )}

        {events.map(event => {
          const agentId = agentNameToId(event.agent_name)
          const color = AGENT_COLORS[agentId] ?? '#a78bfa'
          return (
            <div key={event.id}
              className="rounded-xl px-3 py-2.5 transition-colors"
              style={{ background: '#0b1018', border: '1px solid #1a2236' }}
            >
              {/* Agent + time */}
              <div className="flex items-center justify-between mb-1.5 gap-2">
                <div className="flex items-center gap-1.5">
                  {/* Color dot representing agent */}
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 4px ${color}80` }} />
                  <span className="text-[12px] font-semibold truncate" style={{ color, fontFamily: 'var(--font-bricolage)' }}>
                    {event.agent_name}
                  </span>
                </div>
                <span className="text-[10px] flex-shrink-0" style={{ color: '#2e3b52' }}>
                  {timeAgo(event.created_at)}
                </span>
              </div>
              {/* Event type */}
              <p className="text-[12px] leading-snug" style={{ color: '#8b98b4' }}>
                {getEventMeta(event.event_type).label}
              </p>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid #1a2236' }}>
        <div className="flex items-center gap-2 text-[11px]" style={{ color: '#2e3b52' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          Updates every 60s via orchestrator
        </div>
      </div>
    </div>
  )
}
