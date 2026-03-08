import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center gap-10 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Sangam<span className="text-[#6366f1]">.ai</span>
        </h1>
        <p className="text-[#6b7280] mt-3 text-sm max-w-xs">
          The assembly of the finest AI minds, at your command.
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
