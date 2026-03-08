'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function TopBar({ title }: { title?: string }) {
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-[#1e1e2e] bg-[#0a0a0f]">
      <h1 className="text-sm font-semibold text-white">{title ?? 'Dashboard'}</h1>
      <div className="flex items-center gap-4">
        <button
          onClick={signOut}
          className="text-xs text-[#6b7280] hover:text-white transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
