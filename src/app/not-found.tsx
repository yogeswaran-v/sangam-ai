import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-6xl font-bold text-[#1e1e2e]">404</div>
      <h1 className="text-2xl font-bold text-white">Page not found</h1>
      <p className="text-[#6b7280] text-sm text-center max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="px-6 py-2.5 border border-[#1e1e2e] text-white rounded-lg text-sm hover:border-[#6366f1] transition-colors"
        >
          Home
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-2.5 bg-[#6366f1] text-white rounded-lg text-sm hover:bg-[#818cf8] transition-colors"
        >
          Dashboard
        </Link>
      </div>
    </div>
  )
}
