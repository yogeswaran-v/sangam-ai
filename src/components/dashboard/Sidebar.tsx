'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Icons = {
  MissionControl: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      <path d="m4.93 4.93 2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
    </svg>
  ),
  Kanban: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="5" height="18" rx="1" />
      <rect x="10" y="3" width="5" height="11" rx="1" />
      <rect x="17" y="3" width="5" height="15" rx="1" />
    </svg>
  ),
  Chat: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  PixelWorld: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Demo: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="13" rx="2" />
      <polyline points="8 21 12 17 16 21" />
    </svg>
  ),
  Approvals: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  Usage: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Settings: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Team: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Close: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Menu: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" />
    </svg>
  ),
}

const NAV = [
  { href: '/dashboard',                label: 'Mission Control', Icon: Icons.MissionControl },
  { href: '/dashboard/kanban',         label: 'Kanban',          Icon: Icons.Kanban },
  { href: '/dashboard/chat',           label: 'Team Chat',       Icon: Icons.Chat },
  { href: '/dashboard/pixel-world',    label: 'Pixel World',     Icon: Icons.PixelWorld },
  { href: '/dashboard/team',           label: 'The Team',        Icon: Icons.Team },
  { href: '/dashboard/demo',           label: 'Product Demo',    Icon: Icons.Demo },
  { href: '/dashboard/approvals',      label: 'Approvals',       Icon: Icons.Approvals },
  { href: '/dashboard/usage',          label: 'Usage & Billing', Icon: Icons.Usage },
  { href: '/dashboard/settings',       label: 'Settings',        Icon: Icons.Settings },
]

const SECTION_BREAK = 7 // insert separator before index 7 (Usage)

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navContent = (
    <>
      {/* Logo */}
      <div className="h-[60px] flex items-center justify-between px-5 flex-shrink-0"
        style={{ borderBottom: '1px solid #1a2236' }}>
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 rounded-lg group-hover:border-[#7c3aed]/50 transition-colors"
              style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(167,139,250,0.2)' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#a78bfa]"
                style={{ boxShadow: '0 0 8px rgba(167,139,250,0.7)' }} />
            </div>
          </div>
          <span className="text-[15px] font-bold tracking-tight text-[#eef2f8]"
            style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>
            Sangam<span className="text-[#a78bfa]">.ai</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden transition-colors cursor-pointer p-1 rounded-lg"
          style={{ color: '#4a566e' }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#eef2f8'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#4a566e'}
          aria-label="Close menu"
        >
          <Icons.Close />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map((item, idx) => {
          const active = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <div key={item.href}>
              {idx === SECTION_BREAK && (
                <div className="my-2 mx-1 h-px" style={{ background: '#1a2236' }} />
              )}
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                aria-current={active ? 'page' : undefined}
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 cursor-pointer group overflow-hidden"
                style={active ? {
                  background: 'rgba(124,58,237,0.1)',
                  color: '#eef2f8',
                  border: '1px solid rgba(167,139,250,0.15)',
                } : {
                  color: '#4a566e',
                  border: '1px solid transparent',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.03)'
                    ;(e.currentTarget as HTMLAnchorElement).style.color = '#8b98b4'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLAnchorElement).style.color = '#4a566e'
                  }
                }}
              >
                {/* Active left strip */}
                {active && (
                  <span className="absolute left-0 top-[20%] bottom-[20%] w-[2px] rounded-r-sm"
                    style={{ background: '#a78bfa', boxShadow: '0 0 6px rgba(167,139,250,0.7)' }} />
                )}
                <span style={{ color: active ? '#a78bfa' : 'inherit' }} className="flex-shrink-0">
                  <item.Icon />
                </span>
                <span className="font-medium flex-1">{item.label}</span>
              </Link>
            </div>
          )
        })}
      </nav>

      {/* Status footer */}
      <div className="px-4 py-4 flex-shrink-0" style={{ borderTop: '1px solid #1a2236' }}>
        <div className="flex items-center gap-2 text-[12px]" style={{ color: '#4a566e' }}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-60" />
            <span className="relative block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          All agents online
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2.5 rounded-xl cursor-pointer transition-colors"
        style={{ background: '#0b1018', border: '1px solid #1a2236', color: '#eef2f8' }}
        aria-label="Open menu"
      >
        <Icons.Menu />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed left-0 top-0 h-full w-[240px] flex flex-col z-50 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ background: '#0b1018', borderRight: '1px solid #1a2236' }}
      >
        {navContent}
      </aside>
    </>
  )
}
