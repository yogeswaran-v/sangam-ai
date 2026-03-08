import type { ChatChannel } from '@/types/chat'

const DEPT_ICONS: Record<string, string> = {
  leadership: '👑',
  engineering: '⚙️',
  product: '📋',
  marketing: '📣',
  sales: '💼',
  finance: '📊',
}

interface Props {
  channels: ChatChannel[]
  activeChannelId: string | null
  onSelect: (channelId: string) => void
}

export function ChannelList({ channels, activeChannelId, onSelect }: Props) {
  return (
    <aside className="w-56 flex-shrink-0 border-r border-[#1e1e2e] flex flex-col">
      <div className="p-4 border-b border-[#1e1e2e]">
        <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-widest">Channels</h3>
      </div>
      <nav className="flex-1 p-2 flex flex-col gap-1 overflow-y-auto">
        {channels.map(ch => (
          <button
            key={ch.id}
            onClick={() => onSelect(ch.id)}
            className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeChannelId === ch.id
                ? 'bg-[#6366f1]/15 text-white border border-[#6366f1]/30'
                : 'text-[#6b7280] hover:bg-[#12121a] hover:text-white'
            }`}
          >
            <span>{DEPT_ICONS[ch.department] ?? '💬'}</span>
            <span className="truncate">{ch.name}</span>
          </button>
        ))}
        {channels.length === 0 && (
          <p className="text-xs text-[#4b5563] px-3 py-4">No channels yet. Complete onboarding to activate your team.</p>
        )}
      </nav>
    </aside>
  )
}
