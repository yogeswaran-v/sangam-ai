import { TopBar } from '@/components/dashboard/TopBar'
import { ApprovalsCenter } from '@/components/approvals/ApprovalsCenter'

export default function ApprovalsPage() {
  return (
    <div>
      <TopBar title="Approvals" />
      <main className="p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Approval Centre</h2>
            <p className="text-[#6b7280] text-sm mt-1">
              Review and respond to requests from your agent team.
            </p>
          </div>
          <ApprovalsCenter />
        </div>
      </main>
    </div>
  )
}
