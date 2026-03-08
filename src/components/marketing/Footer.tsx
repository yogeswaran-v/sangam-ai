import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-[#1e1e2e] mt-32">
      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-start justify-between gap-10">
        <div>
          <div className="text-xl font-bold text-white">
            Sangam<span className="text-[#6366f1]">.ai</span>
          </div>
          <p className="text-[#6b7280] text-sm mt-2 max-w-xs">
            The assembly of the finest AI minds, at your command.
          </p>
        </div>
        <div className="flex gap-16 text-sm">
          <div className="flex flex-col gap-3">
            <div className="text-white font-medium">Product</div>
            <Link href="#features" className="text-[#6b7280] hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="text-[#6b7280] hover:text-white transition-colors">Pricing</Link>
            <Link href="/login" className="text-[#6b7280] hover:text-white transition-colors">Sign in</Link>
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-white font-medium">Legal</div>
            <Link href="/privacy" className="text-[#6b7280] hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="text-[#6b7280] hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 pb-8 text-[#4b5563] text-xs">
        © 2026 Sangam.ai. Built with AI, for builders.
      </div>
    </footer>
  )
}
