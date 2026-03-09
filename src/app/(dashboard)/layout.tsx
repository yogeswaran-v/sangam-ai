import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { ErrorBoundary } from '@/components/dashboard/ErrorBoundary'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!customer) redirect('/onboarding')

  const { data: team } = await supabase
    .from('agent_teams')
    .select('onboarding_complete')
    .eq('customer_id', customer.id)
    .single()

  if (!team || !team.onboarding_complete) redirect('/onboarding')

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Sidebar />
      <div className="lg:ml-64 pt-14 lg:pt-0">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </div>
    </div>
  )
}
