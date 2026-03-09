'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const SignOutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <header
      className="h-14 flex items-center justify-between px-6 sticky top-0 z-20"
      style={{
        background: 'rgba(11,16,24,0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #1a2236',
      }}
    >
      <div className="flex items-center gap-3">
        <span className="w-px h-4 rounded-full" style={{ background: '#7c3aed' }} />
        <h1
          className="text-[13px] font-semibold text-[#eef2f8] tracking-wide"
          style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}
        >
          {title ?? 'Dashboard'}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* System status */}
        <div className="hidden sm:flex items-center gap-2 text-[12px]" style={{ color: '#4a566e' }}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-60" />
            <span className="relative block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          System nominal
        </div>

        {/* Sign out */}
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 text-[12px] transition-colors duration-200 cursor-pointer px-3 py-1.5 rounded-lg"
          style={{ color: '#4a566e', border: '1px solid transparent' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#eef2f8'
            ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#1a2236'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#4a566e'
            ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'
          }}
          aria-label="Sign out"
        >
          <SignOutIcon />
          <span className="hidden sm:inline font-medium">Sign out</span>
        </button>
      </div>
    </header>
  )
}
