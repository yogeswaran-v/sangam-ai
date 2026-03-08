import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/dashboard/TopBar'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let customerData = null
  let stats = { activeTasks: 0, pendingApprovals: 0, messagesToday: 0, tokensThisMonth: 0 }
  let mission = null

  if (user) {
    const { data: customer } = await supabase
      .from('customers')
      .select('id, name, plan')
      .eq('user_id', user.id)
      .single()

    if (customer) {
      customerData = customer

      const { data: mc } = await supabase
        .from('mission_control')
        .select('vision, product_requirements, monetary_goals, timeline')
        .eq('customer_id', customer.id)
        .single()
      mission = mc

      const { data: board } = await supabase
        .from('kanban_boards')
        .select('id')
        .eq('customer_id', customer.id)
        .single()

      if (board) {
        const { count: activeCount } = await supabase
          .from('kanban_cards')
          .select('id', { count: 'exact', head: true })
          .eq('board_id', board.id)
          .in('column_name', ['in_progress', 'review'])
        stats.activeTasks = activeCount ?? 0
      }

      const { count: approvalCount } = await supabase
        .from('approval_requests')
        .select('id', { count: 'exact', head: true })
        .eq('customer_id', customer.id)
        .eq('status', 'pending')
      stats.pendingApprovals = approvalCount ?? 0

      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const { count: msgCount } = await supabase
        .from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString())
      stats.messagesToday = msgCount ?? 0

      const monthStart = new Date()
      monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)
      const { data: usageRows } = await supabase
        .from('token_usage')
        .select('input_tokens, output_tokens')
        .eq('customer_id', customer.id)
        .gte('recorded_at', monthStart.toISOString())
      stats.tokensThisMonth = (usageRows ?? []).reduce((sum, r) => sum + r.input_tokens + r.output_tokens, 0)
    }
  }

  const planBadgeColor = { starter: 'text-[#6b7280]', pro: 'text-[#6366f1]', scale: 'text-[#10b981]' }

  return (
    <div>
      <TopBar title="Mission Control" />
      <main className="p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {customerData?.name ? `Welcome back, ${customerData.name}` : 'Command Centre'}
              </h2>
              <p className="text-[#6b7280] text-sm mt-1">Your AI team is standing by.</p>
            </div>
            {customerData?.plan && (
              <span className={`text-xs font-semibold uppercase tracking-widest ${planBadgeColor[customerData.plan as keyof typeof planBadgeColor] ?? 'text-[#6b7280]'}`}>
                {customerData.plan} plan
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Tasks Active', value: stats.activeTasks || '—', icon: '📋', href: '/dashboard/kanban' },
              { label: 'Pending Approvals', value: stats.pendingApprovals || '—', icon: '✅', href: '/dashboard/approvals' },
              { label: 'Messages Today', value: stats.messagesToday || '—', icon: '💬', href: '/dashboard/chat' },
              { label: 'Tokens This Month', value: stats.tokensThisMonth > 1000 ? `${(stats.tokensThisMonth/1000).toFixed(1)}K` : stats.tokensThisMonth || '—', icon: '⚡', href: '/dashboard/usage' },
            ].map(stat => (
              <Link key={stat.label} href={stat.href} className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-5 hover:border-[#6366f1]/50 transition-colors">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-[#6b7280] mt-1">{stat.label}</div>
              </Link>
            ))}
          </div>

          {/* Mission summary */}
          {mission ? (
            <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Mission Control</h3>
                <Link href="/dashboard/settings" className="text-xs text-[#6366f1] hover:text-[#818cf8] transition-colors">
                  Edit mission →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Vision', value: mission.vision },
                  { label: 'Product', value: mission.product_requirements },
                  { label: 'Goals', value: mission.monetary_goals },
                  { label: 'Timeline', value: mission.timeline },
                ].filter(f => f.value).map(field => (
                  <div key={field.label}>
                    <div className="text-xs text-[#6b7280] uppercase tracking-widest mb-2">{field.label}</div>
                    <p className="text-[#d1d5db] text-sm leading-relaxed line-clamp-3">{field.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold text-white mb-2">Agents initialising</h3>
              <p className="text-[#6b7280] text-sm max-w-md mx-auto">
                Your vision is being processed. Agents will begin working on your mission shortly.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
