import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4">
      <div className="glass-strong rounded-2xl border border-[#1a2236] px-5 h-13 flex items-center justify-between"
        style={{ height: '52px', boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,58,237,0.06)' }}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="relative w-7 h-7 flex-shrink-0">
            <div className="absolute inset-0 rounded-lg bg-[#7c3aed]/20 border border-[#7c3aed]/30 group-hover:border-[#7c3aed]/60 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#a78bfa]" style={{ boxShadow: '0 0 8px rgba(167,139,250,0.8)' }} />
            </div>
          </div>
          <span className="text-[15px] font-bold tracking-tight text-[#eef2f8]"
            style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>
            Sangam<span className="text-[#a78bfa]">.ai</span>
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-7">
          {['Features', 'Pricing', 'Agents'].map(item => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-[13px] text-[#4a566e] hover:text-[#8b98b4] transition-colors duration-200 font-medium"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href="/login"
            className="px-4 py-2 text-[13px] text-[#8b98b4] hover:text-[#eef2f8] transition-colors duration-200 font-medium">
            Sign in
          </Link>
          <Link href="/login"
            className="px-4 py-2 text-[13px] bg-[#7c3aed] text-white rounded-xl font-semibold transition-all duration-200 hover:bg-[#8b5cf6] cursor-pointer"
            style={{ boxShadow: '0 0 16px rgba(124,58,237,0.35), 0 2px 8px rgba(0,0,0,0.3)' }}>
            Get started
          </Link>
        </div>
      </div>
    </nav>
  )
}
