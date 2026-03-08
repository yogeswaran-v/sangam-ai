import { TopBar } from '@/components/dashboard/TopBar'

export default function ChatPage() {
  return (
    <div>
      <TopBar title="Team Chat" />
      <main className="p-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2">Team Chat</h2>
          <p className="text-[#6b7280] text-sm mb-8">Messages from your agent team.</p>
          <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-12 text-center text-[#6b7280]">
            Chat loading after Task 11 implementation
          </div>
        </div>
      </main>
    </div>
  )
}
