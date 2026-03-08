import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { headers } from 'next/headers'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-invoke-path') ?? headersList.get('x-next-intl-path') ?? ''

  // Don't apply redirect check on onboarding route (it's in this group)
  const isOnboarding = pathname.includes('/onboarding')

  if (!isOnboarding) {
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
  }

  if (isOnboarding) {
    // Onboarding: no sidebar, centered layout
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Sidebar />
      <div className="ml-64">
        {children}
      </div>
    </div>
  )
}
