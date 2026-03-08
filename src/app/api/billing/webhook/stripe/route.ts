import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleStripeWebhook } from '@/lib/billing/stripe'

export const config = { api: { bodyParser: false } }

export async function POST(request: NextRequest) {
  const payload = await request.text()
  const signature = request.headers.get('stripe-signature') ?? ''

  const result = await handleStripeWebhook(payload, signature)
  if (!result) {
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 })
  }

  const supabase = await createClient()

  if (result.event === 'subscription_started') {
    await supabase
      .from('customers')
      .update({ plan: result.plan })
      .eq('id', result.customerId)
  } else if (result.event === 'subscription_cancelled') {
    await supabase
      .from('customers')
      .update({ plan: 'starter' })
      .eq('id', result.customerId)
  }

  return NextResponse.json({ received: true })
}
