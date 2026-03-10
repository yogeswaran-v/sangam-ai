import { TopBar } from '@/components/dashboard/TopBar'
import { TeamDirectory } from '@/components/team/TeamDirectory'

export const metadata = { title: 'Team | Sangam.ai' }

export default function TeamPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TopBar title="The Team" />
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <TeamDirectory />
      </div>
    </div>
  )
}
