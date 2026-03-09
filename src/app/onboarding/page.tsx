import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // If already onboarded, redirect to dashboard
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (customer) {
    const { data: team } = await supabase
      .from('agent_teams')
      .select('onboarding_complete')
      .eq('customer_id', customer.id)
      .single()

    if (team?.onboarding_complete) redirect('/dashboard')
  }

  return <OnboardingWizard />
}
