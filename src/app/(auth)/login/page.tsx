import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center gap-8 px-4 py-16">
      {/* Branding */}
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6 cursor-pointer group">
          <div className="relative w-9 h-9">
            <div className="absolute inset-0 rounded-xl group-hover:border-[#7c3aed]/50 transition-colors"
              style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(167,139,250,0.25)' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#a78bfa]"
                style={{ boxShadow: '0 0 10px rgba(167,139,250,0.8)' }} />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-[#eef2f8] tracking-tight"
            style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>
            Sangam<span className="text-[#a78bfa]">.ai</span>
          </span>
        </Link>
        <h1 className="text-[28px] font-extrabold text-[#eef2f8] mb-2"
          style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>
          Welcome back
        </h1>
        <p className="text-[14px] text-[#4a566e]">Sign in to your mission command centre.</p>
      </div>

      <LoginForm />

      <Link href="/"
        className="text-[13px] text-[#4a566e] hover:text-[#8b98b4] transition-colors duration-200 cursor-pointer">
        ← Back to home
      </Link>
    </div>
  )
}
