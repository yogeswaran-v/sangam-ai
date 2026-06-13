'use client'

import { useState } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Agents', href: '#agents' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

export function LandingNav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <nav
        aria-label="Main"
        className="glass-strong mx-auto max-w-5xl rounded-2xl border border-[#1a2236]"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,58,237,0.06)' }}
      >
        <div className="flex h-14 items-center justify-between pl-4 pr-2 sm:px-5">
          {/* Logo */}
          <Link href="/" className="flex min-h-[44px] cursor-pointer items-center gap-2.5">
            <span className="relative h-7 w-7 flex-shrink-0" aria-hidden="true">
              <span className="absolute inset-0 rounded-lg border border-[#7c3aed]/30 bg-[#7c3aed]/20" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span
                  className="h-2.5 w-2.5 rounded-full bg-[#a78bfa]"
                  style={{ boxShadow: '0 0 8px rgba(167,139,250,0.8)' }}
                />
              </span>
            </span>
            <span
              className="text-[15px] font-bold tracking-tight text-[#eef2f8]"
              style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}
            >
              Sangam<span className="text-[#a78bfa]">.ai</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-h-[44px] cursor-pointer items-center rounded-lg px-3 text-[14px] font-medium text-[#8b98b4] transition-colors duration-200 hover:text-[#eef2f8]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <Link
              href="/login"
              className="hidden min-h-[44px] cursor-pointer items-center rounded-lg px-3 text-[14px] font-medium text-[#8b98b4] transition-colors duration-200 hover:text-[#eef2f8] sm:flex"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="flex min-h-[44px] cursor-pointer items-center rounded-xl bg-[#7c3aed] px-4 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-[#8b5cf6]"
              style={{ boxShadow: '0 0 16px rgba(124,58,237,0.35), 0 2px 8px rgba(0,0,0,0.3)' }}
            >
              Start free trial
            </Link>

            {/* Mobile menu toggle */}
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen(v => !v)}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-[#8b98b4] transition-colors duration-200 hover:text-[#eef2f8] md:hidden"
            >
              {open ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="3" y1="7" x2="21" y2="7" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="17" x2="21" y2="17" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile panel */}
        {open && (
          <div id="mobile-menu" className="border-t border-[#1a2236] px-3 pb-3 pt-2 md:hidden">
            <div className="flex flex-col">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[48px] cursor-pointer items-center rounded-xl px-3 text-[15px] font-medium text-[#8b98b4] transition-colors duration-200 hover:bg-[#101620] hover:text-[#eef2f8]"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex min-h-[48px] cursor-pointer items-center rounded-xl px-3 text-[15px] font-medium text-[#8b98b4] transition-colors duration-200 hover:bg-[#101620] hover:text-[#eef2f8]"
              >
                Sign in
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
