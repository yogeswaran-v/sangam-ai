import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-[#1e1e2e] mt-32">
      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-start justify-between gap-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-[#6366f1]/20 border border-[#6366f1]/40 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#6366f1] shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
            </div>
            <span
              className="text-base font-bold text-white"
              style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
            >
              Sangam<span className="text-[#6366f1]">.ai</span>
            </span>
          </div>
          <p className="text-[#4b5563] text-sm max-w-xs leading-relaxed">
            The assembly of the finest AI minds, at your command.
          </p>
        </div>
        <div className="flex gap-16 text-sm">
          <div className="flex flex-col gap-3">
            <div className="text-[#9ca3af] font-semibold text-xs uppercase tracking-widest mb-1">Product</div>
            <Link href="#features" className="text-[#4b5563] hover:text-white transition-colors duration-200">Features</Link>
            <Link href="#pricing" className="text-[#4b5563] hover:text-white transition-colors duration-200">Pricing</Link>
            <Link href="/login" className="text-[#4b5563] hover:text-white transition-colors duration-200">Sign in</Link>
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-[#9ca3af] font-semibold text-xs uppercase tracking-widest mb-1">Legal</div>
            <Link href="/privacy" className="text-[#4b5563] hover:text-white transition-colors duration-200">Privacy</Link>
            <Link href="/terms" className="text-[#4b5563] hover:text-white transition-colors duration-200">Terms</Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 pb-8 flex items-center justify-between">
        <p className="text-[#374151] text-xs">© 2026 Sangam.ai. Built with AI, for builders.</p>
        <div className="flex items-center gap-1.5 text-xs text-[#374151]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.8)]" />
          All systems operational
        </div>
      </div>
    </footer>
  )
}
