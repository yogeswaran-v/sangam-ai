import { TopBar } from '@/components/dashboard/TopBar'

export default function DashboardPage() {
  return (
    <div>
      <TopBar title="Mission Control" />
      <main className="p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Command Centre</h2>
            <p className="text-[#6b7280] text-sm mt-1">Your AI team is standing by.</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Tasks Active', value: '—', icon: '📋' },
              { label: 'Pending Approvals', value: '—', icon: '✅' },
              { label: 'Messages Today', value: '—', icon: '💬' },
              { label: 'Tokens Used', value: '—', icon: '⚡' },
            ].map(stat => (
              <div key={stat.label} className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-5">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-[#6b7280] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Mission Control panel placeholder */}
          <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-lg font-semibold text-white mb-2">Your agents are initialising</h3>
            <p className="text-[#6b7280] text-sm max-w-md mx-auto">
              Once your vision is processed, agents will begin working on your mission. Check back in a few minutes.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
