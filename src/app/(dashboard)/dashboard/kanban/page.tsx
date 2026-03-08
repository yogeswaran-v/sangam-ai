import { TopBar } from '@/components/dashboard/TopBar'

export default function KanbanPage() {
  return (
    <div>
      <TopBar title="Kanban Board" />
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2">Kanban Board</h2>
          <p className="text-[#6b7280] text-sm mb-8">Agent tasks, in progress and queued.</p>
          <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-12 text-center text-[#6b7280]">
            Board loading after Task 10 implementation
          </div>
        </div>
      </main>
    </div>
  )
}
