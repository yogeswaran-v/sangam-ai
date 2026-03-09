import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/dashboard/TopBar'
import Link from 'next/link'

const KanbanIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="5" height="18" rx="1" /><rect x="10" y="3" width="5" height="11" rx="1" /><rect x="17" y="3" width="5" height="15" rx="1" />
  </svg>
)
const ApprovalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
)
const ChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)
const ZapIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)
const RocketIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m3.29 15 1.7 1.71M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
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

  const planStyles: Record<string, { bg: string; border: string; text: string; label: string }> = {
    starter: { bg: 'rgba(255,255,255,0.04)', border: '#253044', text: '#8b98b4', label: 'Starter' },
    pro:     { bg: 'rgba(124,58,237,0.1)',   border: 'rgba(167,139,250,0.3)', text: '#a78bfa', label: 'Pro' },
    scale:   { bg: 'rgba(20,184,166,0.1)',   border: 'rgba(20,184,166,0.3)', text: '#5eead4', label: 'Scale' },
  }

  const statCards = [
    {
      label: 'Tasks Active',
      value: stats.activeTasks || '—',
      Icon: KanbanIcon,
      href: '/dashboard/kanban',
      accent: '#a78bfa',
      accentDim: 'rgba(124,58,237,0.08)',
      accentBorder: 'rgba(167,139,250,0.2)',
    },
    {
      label: 'Pending Approvals',
      value: stats.pendingApprovals || '—',
      Icon: ApprovalIcon,
      href: '/dashboard/approvals',
      accent: '#fb923c',
      accentDim: 'rgba(251,146,60,0.08)',
      accentBorder: 'rgba(251,146,60,0.2)',
    },
    {
      label: 'Messages Today',
      value: stats.messagesToday || '—',
      Icon: ChatIcon,
      href: '/dashboard/chat',
      accent: '#38bdf8',
      accentDim: 'rgba(56,189,248,0.08)',
      accentBorder: 'rgba(56,189,248,0.2)',
    },
    {
      label: 'Tokens / Month',
      value: stats.tokensThisMonth > 1000
        ? `${(stats.tokensThisMonth / 1000).toFixed(1)}K`
        : stats.tokensThisMonth || '—',
      Icon: ZapIcon,
      href: '/dashboard/usage',
      accent: '#4ade80',
      accentDim: 'rgba(74,222,128,0.08)',
      accentBorder: 'rgba(74,222,128,0.2)',
    },
  ]

  const planStyle = planStyles[customerData?.plan ?? 'starter'] ?? planStyles.starter

  return (
    <div>
      <TopBar title="Mission Control" />
      <main className="p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">

          {/* Page header */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h2
                className="text-[22px] font-bold text-[#eef2f8]"
                style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}
              >
                {customerData?.name ? `Welcome back, ${customerData.name}` : 'Command Centre'}
              </h2>
              <p className="text-[13px] mt-1" style={{ color: '#4a566e' }}>
                Your AI team is standing by.
              </p>
            </div>
            {customerData?.plan && (
              <span
                className="flex-shrink-0 text-[11px] font-bold uppercase tracking-[0.12em] px-3 py-1.5 rounded-full"
                style={{ background: planStyle.bg, border: `1px solid ${planStyle.border}`, color: planStyle.text }}
              >
                {planStyle.label}
              </span>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {statCards.map(stat => (
              <Link
                key={stat.label}
                href={stat.href}
                className="stat-card relative rounded-xl p-5 cursor-pointer block"
                style={{
                  background: '#0b1018',
                  border: '1px solid #1a2236',
                  ['--card-border-hover' as string]: stat.accentBorder,
                }}
              >
                {/* Icon badge */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: stat.accentDim, color: stat.accent }}
                >
                  <stat.Icon />
                </div>
                <div
                  className="text-[26px] font-extrabold text-[#eef2f8] mb-1 leading-none"
                  style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}
                >
                  {stat.value}
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4a566e' }}>
                  {stat.label}
                </div>
              </Link>
            ))}
          </div>

          {/* Mission brief */}
          {mission ? (
            <div
              className="rounded-2xl p-7 transition-colors duration-300"
              style={{ background: '#0b1018', border: '1px solid #1a2236' }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-px h-4 rounded-full" style={{ background: '#7c3aed' }} />
                  <h3
                    className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#eef2f8]"
                    style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}
                  >
                    Mission Brief
                  </h3>
                </div>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-1.5 text-[12px] font-medium transition-colors cursor-pointer hover:text-[#a78bfa]"
                  style={{ color: '#7c3aed' }}
                >
                  <EditIcon />
                  Edit
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { label: 'Vision', value: mission.vision },
                  { label: 'Product', value: mission.product_requirements },
                  { label: 'Goals', value: mission.monetary_goals },
                  { label: 'Timeline', value: mission.timeline },
                ].filter(f => f.value).map(field => (
                  <div key={field.label}
                    className="rounded-xl p-4"
                    style={{ background: '#101620', border: '1px solid #1a2236' }}>
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] mb-2"
                      style={{ color: '#4a566e' }}>
                      {field.label}
                    </div>
                    <p className="text-[13px] leading-relaxed line-clamp-3" style={{ color: '#8b98b4' }}>
                      {field.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              className="rounded-2xl p-10 text-center"
              style={{ background: '#0b1018', border: '1px solid #1a2236' }}
            >
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
                style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa' }}
              >
                <RocketIcon />
              </div>
              <h3
                className="text-[18px] font-bold text-[#eef2f8] mb-2"
                style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}
              >
                Agents initialising
              </h3>
              <p className="text-[13px] max-w-sm mx-auto leading-relaxed" style={{ color: '#4a566e' }}>
                Your vision is being processed. Agents will begin working on your mission shortly.
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
