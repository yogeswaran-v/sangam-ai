'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const SignOutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

export function TopBar({ title }: { title?: string }) {
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-[#1e1e2e] bg-[#0a0a0f]/95 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="w-px h-5 bg-[#6366f1]/60" />
        <h1
          className="text-sm font-semibold text-white tracking-wide"
          style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
        >
          {title ?? 'Dashboard'}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#4b5563]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.8)]" />
          <span>System nominal</span>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-white transition-colors duration-200 cursor-pointer"
          aria-label="Sign out"
        >
          <SignOutIcon />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  )
}
