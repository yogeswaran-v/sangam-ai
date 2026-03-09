import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-[#1a2236] mt-32 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at bottom, rgba(124,58,237,0.04) 0%, transparent 70%)' }} />

      <div className="max-w-6xl mx-auto px-6 py-14 flex flex-col md:flex-row items-start justify-between gap-10 relative z-10">
        {/* Brand */}
        <div className="max-w-[240px]">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="relative w-6 h-6">
              <div className="absolute inset-0 rounded-md bg-[#7c3aed]/20 border border-[#7c3aed]/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#a78bfa]" style={{ boxShadow: '0 0 6px rgba(167,139,250,0.7)' }} />
              </div>
            </div>
            <span className="text-[15px] font-bold text-[#eef2f8]"
              style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>
              Sangam<span className="text-[#a78bfa]">.ai</span>
            </span>
          </div>
          <p className="text-[13px] text-[#4a566e] leading-relaxed">
            The assembly of the finest AI minds, at your command.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-14 text-[13px]">
          <div className="flex flex-col gap-3">
            <div className="text-[11px] font-semibold text-[#2e3b52] uppercase tracking-[0.12em] mb-1">Product</div>
            {[['Features', '#features'], ['Pricing', '#pricing'], ['Sign in', '/login']].map(([label, href]) => (
              <Link key={label} href={href} className="text-[#4a566e] hover:text-[#8b98b4] transition-colors duration-200">{label}</Link>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-[11px] font-semibold text-[#2e3b52] uppercase tracking-[0.12em] mb-1">Legal</div>
            {[['Privacy', '/privacy'], ['Terms', '/terms']].map(([label, href]) => (
              <Link key={label} href={href} className="text-[#4a566e] hover:text-[#8b98b4] transition-colors duration-200">{label}</Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-6xl mx-auto px-6 pb-8 flex items-center justify-between relative z-10">
        <p className="text-[12px] text-[#2e3b52]">© 2026 Sangam.ai. Built with AI, for builders.</p>
        <div className="flex items-center gap-2 text-[12px] text-[#2e3b52]">
          <span className="relative w-1.5 h-1.5">
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60" />
            <span className="relative block w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </span>
          All systems operational
        </div>
      </div>
    </footer>
  )
}
