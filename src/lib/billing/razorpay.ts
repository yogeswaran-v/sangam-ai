// Razorpay client — only used server-side
// Package: razorpay (add to package.json if missing)

export const RAZORPAY_PLANS = {
  starter: { amount: 399900, name: 'Starter' }, // ₹3999 in paise
  pro: { amount: 1199900, name: 'Pro' },         // ₹11999 in paise
  scale: { amount: 3299900, name: 'Scale' },     // ₹32999 in paise
} as const

export async function createRazorpayOrder(
  customerId: string,
  plan: keyof typeof RAZORPAY_PLANS
): Promise<{ orderId: string; amount: number; currency: string; key: string }> {
  const Razorpay = (await import('razorpay')).default
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  const planConfig = RAZORPAY_PLANS[plan]

  const order = await razorpay.orders.create({
    amount: planConfig.amount,
    currency: 'INR',
    notes: { customer_id: customerId, plan },
  })

  return {
    orderId: order.id,
    amount: planConfig.amount,
    currency: 'INR',
    key: process.env.RAZORPAY_KEY_ID!,
  }
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const crypto = require('crypto')
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')
  return expectedSignature === signature
}
