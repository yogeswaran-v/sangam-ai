import { TopBar } from '@/components/dashboard/TopBar'
import { UsageDashboard } from '@/components/usage/UsageDashboard'

export default function UsagePage() {
  return (
    <div>
      <TopBar title="Usage & Billing" />
      <main className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Usage & Billing</h2>
          <p className="text-[#6b7280] text-sm mt-1">Token consumption and plan details for the current month.</p>
        </div>
        <UsageDashboard />
      </main>
    </div>
  )
}
