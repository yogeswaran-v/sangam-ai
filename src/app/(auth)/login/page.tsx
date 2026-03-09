import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center gap-8 px-4">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-5 cursor-pointer group">
          <div className="w-8 h-8 rounded-xl bg-[#6366f1]/20 border border-[#6366f1]/40 flex items-center justify-center group-hover:border-[#6366f1]/70 transition-colors">
            <div className="w-3 h-3 rounded-full bg-[#6366f1] shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
          </div>
          <span
            className="text-2xl font-bold text-white tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            Sangam<span className="text-[#6366f1]">.ai</span>
          </span>
        </Link>
        <p className="text-[#4b5563] text-sm max-w-xs leading-relaxed">
          The assembly of the finest AI minds, at your command.
        </p>
      </div>
      <LoginForm />
      <Link
        href="/"
        className="text-sm text-[#374151] hover:text-white transition-colors duration-200 cursor-pointer"
      >
        ← Back to home
      </Link>
    </div>
  )
}
