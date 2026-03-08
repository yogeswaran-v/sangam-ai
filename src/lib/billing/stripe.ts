// Stripe client — only used server-side
// Package: stripe (add to package.json if missing)

export const STRIPE_PLANS = {
  starter: { priceId: process.env.STRIPE_PRICE_STARTER ?? '', amount: 4900, name: 'Starter' },
  pro: { priceId: process.env.STRIPE_PRICE_PRO ?? '', amount: 14900, name: 'Pro' },
  scale: { priceId: process.env.STRIPE_PRICE_SCALE ?? '', amount: 39900, name: 'Scale' },
} as const

export async function createStripeCheckoutSession(
  customerId: string,
  plan: keyof typeof STRIPE_PLANS,
  customerEmail: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' })

  const planConfig = STRIPE_PLANS[plan]

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: customerEmail,
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
    cancel_url: cancelUrl,
    metadata: { customer_id: customerId, plan },
  })

  return session.url!
}

export async function handleStripeWebhook(
  payload: string,
  signature: string
): Promise<{ customerId: string; plan: string; event: string } | null> {
  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' })

  let event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return null
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    return {
      customerId: session.metadata.customer_id,
      plan: session.metadata.plan,
      event: 'subscription_started',
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as any
    return {
      customerId: sub.metadata?.customer_id ?? '',
      plan: 'starter',
      event: 'subscription_cancelled',
    }
  }

  return null
}
