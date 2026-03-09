import Link from 'next/link'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Escape nav — logo + home link */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e2e]">
        <Link href="/" className="text-lg font-bold text-white">
          Sangam<span className="text-[#6366f1]">.ai</span>
        </Link>
        <Link
          href="/"
          className="text-sm text-[#6b7280] hover:text-white transition-colors"
        >
          Back to home
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-4">
        {children}
      </div>
    </div>
  )
}
