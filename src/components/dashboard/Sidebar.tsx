'use client'

import { useState } from 'react'
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
  const [mobileOpen, setMobileOpen] = useState(false)

  const navContent = (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#1e1e2e]">
        <Link href="/dashboard" className="text-lg font-bold text-white">
          Sangam<span className="text-[#6366f1]">.ai</span>
        </Link>
        {/* Close button (mobile only) */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-[#6b7280] hover:text-white text-xl"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              aria-current={active ? 'page' : undefined}
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
    </>
  )

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-[#12121a] border border-[#1e1e2e] text-white"
        aria-label="Open menu"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <rect y="3" width="20" height="2" rx="1" />
          <rect y="9" width="20" height="2" rx="1" />
          <rect y="15" width="20" height="2" rx="1" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — fixed on desktop, slide-in drawer on mobile */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-[#0d0d15] border-r border-[#1e1e2e] flex flex-col z-50 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {navContent}
      </aside>
    </>
  )
}
