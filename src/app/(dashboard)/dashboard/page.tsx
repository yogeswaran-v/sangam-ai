import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/dashboard/TopBar'
import Link from 'next/link'

const KanbanIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="5" height="18" rx="1" /><rect x="10" y="3" width="5" height="11" rx="1" /><rect x="17" y="3" width="5" height="15" rx="1" />
  </svg>
)
const ApprovalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
)
const ChatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)
const ZapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)
const RocketIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m3.29 15 1.7 1.71" />
    <path d="M22 2 11 13" />
    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
)
const EditIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

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

  const planBadge: Record<string, string> = {
    starter: 'border-[#4b5563] text-[#9ca3af]',
    pro: 'border-[#6366f1]/50 text-[#818cf8] shadow-[0_0_8px_rgba(99,102,241,0.3)]',
    scale: 'border-[#10b981]/50 text-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.3)]',
  }

  const statCards = [
    { label: 'Tasks Active', value: stats.activeTasks || '—', Icon: KanbanIcon, href: '/dashboard/kanban', color: 'text-[#6366f1]', glow: 'hover:border-[#6366f1]/40 hover:shadow-[0_0_16px_rgba(99,102,241,0.15)]' },
    { label: 'Pending Approvals', value: stats.pendingApprovals || '—', Icon: ApprovalIcon, href: '/dashboard/approvals', color: 'text-[#f59e0b]', glow: 'hover:border-[#f59e0b]/40 hover:shadow-[0_0_16px_rgba(245,158,11,0.15)]' },
    { label: 'Messages Today', value: stats.messagesToday || '—', Icon: ChatIcon, href: '/dashboard/chat', color: 'text-[#22d3ee]', glow: 'hover:border-[#22d3ee]/40 hover:shadow-[0_0_16px_rgba(34,211,238,0.15)]' },
    { label: 'Tokens This Month', value: stats.tokensThisMonth > 1000 ? `${(stats.tokensThisMonth / 1000).toFixed(1)}K` : stats.tokensThisMonth || '—', Icon: ZapIcon, href: '/dashboard/usage', color: 'text-[#10b981]', glow: 'hover:border-[#10b981]/40 hover:shadow-[0_0_16px_rgba(16,185,129,0.15)]' },
  ]

  return (
    <div>
      <TopBar title="Mission Control" />
      <main className="p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h2
                className="text-2xl font-bold text-white"
                style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
              >
                {customerData?.name ? `Welcome back, ${customerData.name}` : 'Command Centre'}
              </h2>
              <p className="text-[#6b7280] text-sm mt-1 font-medium">Your AI team is standing by.</p>
            </div>
            {customerData?.plan && (
              <span className={`text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border ${planBadge[customerData.plan] ?? planBadge.starter}`}>
                {customerData.plan}
              </span>
            )}
          </div>

          {/* Stats bento grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {statCards.map(stat => (
              <Link
                key={stat.label}
                href={stat.href}
                className={`relative bg-[#0d0d15] border border-[#1e1e2e] rounded-xl p-5 transition-all duration-200 cursor-pointer group ${stat.glow}`}
              >
                <div className={`mb-3 ${stat.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                  <stat.Icon />
                </div>
                <div
                  className="text-2xl font-bold text-white mb-1"
                  style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
                >
                  {stat.value}
                </div>
                <div className="text-[11px] text-[#4b5563] font-medium uppercase tracking-widest">{stat.label}</div>
              </Link>
            ))}
          </div>

          {/* Mission brief */}
          {mission ? (
            <div className="bg-[#0d0d15] border border-[#1e1e2e] rounded-2xl p-8 hover:border-[#6366f1]/20 transition-colors duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-px h-5 bg-[#6366f1]" />
                  <h3
                    className="text-sm font-semibold text-white uppercase tracking-widest"
                    style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
                  >
                    Mission Brief
                  </h3>
                </div>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-1.5 text-xs text-[#6366f1] hover:text-[#818cf8] transition-colors cursor-pointer"
                >
                  <EditIcon />
                  Edit mission
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Vision', value: mission.vision },
                  { label: 'Product', value: mission.product_requirements },
                  { label: 'Goals', value: mission.monetary_goals },
                  { label: 'Timeline', value: mission.timeline },
                ].filter(f => f.value).map(field => (
                  <div key={field.label} className="group">
                    <div className="text-[10px] text-[#4b5563] uppercase tracking-[0.15em] mb-2 font-semibold">{field.label}</div>
                    <p className="text-[#9ca3af] text-sm leading-relaxed line-clamp-3">{field.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-[#0d0d15] border border-[#1e1e2e] rounded-2xl p-10 text-center hover:border-[#6366f1]/20 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#6366f1]/10 border border-[#6366f1]/20 mb-5 text-[#6366f1]">
                <RocketIcon />
              </div>
              <h3
                className="text-lg font-semibold text-white mb-2"
                style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
              >
                Agents initialising
              </h3>
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
