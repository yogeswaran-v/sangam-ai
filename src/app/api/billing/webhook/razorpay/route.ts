import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyRazorpaySignature } from '@/lib/billing/razorpay'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, customer_id } = body

  if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()
  await supabase
    .from('customers')
    .update({ plan })
    .eq('id', customer_id)

  return NextResponse.json({ success: true })
}
