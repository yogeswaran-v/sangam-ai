import { TopBar } from '@/components/dashboard/TopBar'
import { SettingsForm } from '@/components/settings/SettingsForm'

export default function SettingsPage() {
  return (
    <div>
      <TopBar title="Settings" />
      <main className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-[#9ca3af] text-sm mt-1">Manage your profile, notifications, and mission.</p>
        </div>
        <SettingsForm />
      </main>
    </div>
  )
}
