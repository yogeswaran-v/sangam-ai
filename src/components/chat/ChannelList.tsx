import React from 'react'
import type { ChatChannel } from '@/types/chat'

// SVG icons for departments
const DeptIcons: Record<string, () => React.ReactElement> = {
  leadership: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  engineering: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  product: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="5" height="18" rx="1" /><rect x="10" y="3" width="5" height="11" rx="1" /><rect x="17" y="3" width="5" height="15" rx="1" />
    </svg>
  ),
  marketing: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  sales: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  finance: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
}

const DefaultIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

interface Props {
  channels: ChatChannel[]
  activeChannelId: string | null
  onSelect: (channelId: string) => void
}

export function ChannelList({ channels, activeChannelId, onSelect }: Props) {
  return (
    <aside className="w-56 flex-shrink-0 border-r border-[#1e1e2e] flex flex-col bg-[#07070a]">
      <div className="p-4 border-b border-[#1e1e2e]">
        <h3 className="text-[10px] font-bold text-[#374151] uppercase tracking-[0.15em]">Channels</h3>
      </div>
      <nav className="flex-1 p-2 flex flex-col gap-0.5 overflow-y-auto">
        {channels.map(ch => {
          const Icon = DeptIcons[ch.department] ?? DefaultIcon
          const active = activeChannelId === ch.id
          return (
            <button
              key={ch.id}
              onClick={() => onSelect(ch.id)}
              className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer group ${
                active
                  ? 'bg-[#6366f1]/15 text-white border border-[#6366f1]/30 shadow-[0_0_8px_rgba(99,102,241,0.1)]'
                  : 'text-[#4b5563] hover:bg-[#12121a] hover:text-[#d1d5db] border border-transparent'
              }`}
            >
              <span className={`flex-shrink-0 transition-colors ${active ? 'text-[#818cf8]' : 'text-[#374151] group-hover:text-[#818cf8]'}`}>
                <Icon />
              </span>
              <span className="truncate font-medium">{ch.name}</span>
            </button>
          )
        })}
        {channels.length === 0 && (
          <p className="text-xs text-[#374151] px-3 py-4 leading-relaxed">
            No channels yet. Complete onboarding to activate your team.
          </p>
        )}
      </nav>
    </aside>
  )
}
