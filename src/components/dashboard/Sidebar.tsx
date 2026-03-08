'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard', label: 'Mission Control', icon: '🎯' },
  { href: '/dashboard/kanban', label: 'Kanban Board', icon: '📋' },
  { href: '/dashboard/chat', label: 'Team Chat', icon: '💬' },
  { href: '/dashboard/pixel-world', label: 'Pixel World', icon: '🌍' },
  { href: '/dashboard/approvals', label: 'Approvals', icon: '✅' },
  { href: '/dashboard/usage', label: 'Usage & Billing', icon: '📊' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0d0d15] border-r border-[#1e1e2e] flex flex-col z-40">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[#1e1e2e]">
        <Link href="/dashboard" className="text-lg font-bold text-white">
          Sangam<span className="text-[#6366f1]">.ai</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active
                  ? 'bg-[#6366f1]/15 text-white border border-[#6366f1]/30'
                  : 'text-[#6b7280] hover:bg-[#12121a] hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: status indicator */}
      <div className="px-4 py-4 border-t border-[#1e1e2e]">
        <div className="flex items-center gap-2 text-xs text-[#6b7280]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Agents online
        </div>
      </div>
    </aside>
  )
}
