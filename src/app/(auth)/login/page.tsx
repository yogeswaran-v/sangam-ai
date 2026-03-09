import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center gap-10 px-4">
      <div className="text-center">
        <Link href="/" className="text-4xl font-bold text-white tracking-tight hover:opacity-90 transition-opacity">
          Sangam<span className="text-[#6366f1]">.ai</span>
        </Link>
        <p className="text-[#6b7280] mt-3 text-sm max-w-xs">
          The assembly of the finest AI minds, at your command.
        </p>
      </div>
      <LoginForm />
      <Link
        href="/"
        className="text-sm text-[#6b7280] hover:text-white transition-colors"
      >
        ← Back to home
      </Link>
    </div>
  )
}
