import type { AgentEvent } from '@/types/pixel'

interface Props {
  events: AgentEvent[]
}

export function ActivityFeed({ events }: Props) {
  return (
    <div className="w-72 flex-shrink-0 border-l border-[#1e1e2e] flex flex-col">
      <div className="p-4 border-b border-[#1e1e2e]">
        <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-widest">Live Activity</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {events.length === 0 && (
          <p className="text-xs text-[#4b5563] px-2 py-4 text-center">
            Waiting for agent activity...
          </p>
        )}
        {events.map(event => (
          <div key={event.id} className="bg-[#12121a] border border-[#1e1e2e] rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-[#9ca3af]">{event.agent_name}</span>
              <span className="text-xs text-[#4b5563]">·</span>
              <span className="text-xs text-[#4b5563]">
                {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-xs text-[#6b7280]">{event.event_type}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
