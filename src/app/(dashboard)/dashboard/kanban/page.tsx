import { TopBar } from '@/components/dashboard/TopBar'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'

export default function KanbanPage() {
  return (
    <div>
      <TopBar title="Kanban Board" />
      <main className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Task Board</h2>
          <p className="text-[#6b7280] text-sm mt-1">Agent tasks and work in progress</p>
        </div>
        <KanbanBoard />
      </main>
    </div>
  )
}
