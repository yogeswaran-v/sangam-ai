import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createStripeCheckoutSession } from '@/lib/billing/stripe'
import { createRazorpayOrder } from '@/lib/billing/razorpay'

const VALID_PLANS = ['starter', 'pro', 'scale'] as const
type Plan = typeof VALID_PLANS[number]

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const plan = body.plan as Plan

  if (!VALID_PLANS.includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('id, email, currency')
    .eq('user_id', user.id)
    .single()

  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }

  const origin = request.headers.get('origin') ?? 'http://localhost:3000'

  try {
    if (customer.currency === 'inr') {
      const order = await createRazorpayOrder(customer.id, plan)
      return NextResponse.json({ provider: 'razorpay', ...order })
    } else {
      const url = await createStripeCheckoutSession(
        customer.id,
        plan,
        customer.email,
        `${origin}/dashboard/usage?success=1`,
        `${origin}/dashboard/usage?cancelled=1`
      )
      return NextResponse.json({ provider: 'stripe', url })
    }
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
