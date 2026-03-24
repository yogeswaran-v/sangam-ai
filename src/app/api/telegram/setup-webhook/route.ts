import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bot_token } = await req.json()
  if (!bot_token) return NextResponse.json({ error: 'Bot token required' }, { status: 400 })

  // Resolve the public webhook URL
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)

  if (!appUrl) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_APP_URL is not set. Add it to your environment variables.' },
      { status: 500 }
    )
  }

  const webhookUrl = `${appUrl}/api/telegram/webhook`

  // Register the webhook with Telegram
  const tgRes = await fetch(
    `https://api.telegram.org/bot${bot_token}/setWebhook`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message'],
      }),
    }
  )

  const tgData = await tgRes.json()
  if (!tgData.ok) {
    return NextResponse.json(
      { error: tgData.description ?? 'Telegram rejected the webhook' },
      { status: 400 }
    )
  }

  // Persist webhook_active flag
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (customer) {
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    await admin
      .from('customers')
      .update({ telegram_webhook_active: true })
      .eq('id', customer.id)
  }

  return NextResponse.json({ ok: true, webhookUrl })
}

// Allow checking current webhook info
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: customer } = await supabase
    .from('customers')
    .select('telegram_bot_token, telegram_webhook_active')
    .eq('user_id', user.id)
    .single()

  if (!customer?.telegram_bot_token) {
    return NextResponse.json({ registered: false })
  }

  const tgRes = await fetch(
    `https://api.telegram.org/bot${customer.telegram_bot_token}/getWebhookInfo`
  )
  const info = await tgRes.json()

  return NextResponse.json({
    registered: !!(info.result?.url),
    webhookUrl: info.result?.url ?? null,
    pendingUpdates: info.result?.pending_update_count ?? 0,
    lastError: info.result?.last_error_message ?? null,
  })
}
