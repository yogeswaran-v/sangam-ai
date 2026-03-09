import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="fixed top-4 left-4 right-4 z-50 rounded-2xl border border-[#1e1e2e] bg-[#0a0a0f]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-6 h-6 rounded-lg bg-[#6366f1]/20 border border-[#6366f1]/40 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#6366f1] shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
          </div>
          <span
            className="text-base font-bold tracking-tight text-white"
            style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            Sangam<span className="text-[#6366f1]">.ai</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-[#6b7280]">
          <Link href="#features" className="hover:text-white transition-colors duration-200">Features</Link>
          <Link href="#pricing" className="hover:text-white transition-colors duration-200">Pricing</Link>
          <Link href="#agents" className="hover:text-white transition-colors duration-200">Agents</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm text-[#6b7280] hover:text-white transition-colors duration-200 cursor-pointer">
            Sign in
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 text-sm bg-[#6366f1] text-white rounded-xl hover:bg-[#818cf8] transition-all duration-200 font-semibold cursor-pointer shadow-[0_0_12px_rgba(99,102,241,0.3)] hover:shadow-[0_0_16px_rgba(99,102,241,0.5)]"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  )
}
