import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1e1e2e] bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white">
          Sangam<span className="text-[#6366f1]">.ai</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-[#9ca3af]">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="#agents" className="hover:text-white transition-colors">Agents</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm text-[#9ca3af] hover:text-white transition-colors">
            Sign in
          </Link>
          <Link href="/login" className="px-4 py-2 text-sm bg-[#6366f1] text-white rounded-lg hover:bg-[#818cf8] transition-colors font-medium">
            Get started
          </Link>
        </div>
      </div>
    </nav>
  )
}
