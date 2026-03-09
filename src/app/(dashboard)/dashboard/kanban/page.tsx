import { TopBar } from '@/components/dashboard/TopBar'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'

export default function KanbanPage() {
  return (
    <div>
      <TopBar title="Kanban Board" />
      <main className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}>Task Board</h2>
          <p className="text-[#4b5563] text-sm mt-1">Agent tasks and work in progress</p>
        </div>
        <KanbanBoard />
      </main>
    </div>
  )
}
