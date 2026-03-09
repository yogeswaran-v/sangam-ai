import Link from 'next/link'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(99,102,241,0.08),transparent)] pointer-events-none" />

      {/* Escape nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-[#1e1e2e] bg-[#0a0a0f]/80 backdrop-blur-sm">
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
        <Link
          href="/"
          className="text-sm text-[#4b5563] hover:text-white transition-colors duration-200"
        >
          Back to home
        </Link>
      </header>
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </div>
    </div>
  )
}
