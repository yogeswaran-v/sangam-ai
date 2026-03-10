import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import axios from 'axios'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { channel, chat_id, phone } = await req.json()

  const TEST_MESSAGE = `\u2705 *Sangam.ai connected*\n\nYour CEO Agent will send updates and approval requests here.\n\n_This is a test message._`

  try {
    if (channel === 'telegram') {
      const token = process.env.TELEGRAM_BOT_TOKEN
      if (!token) return NextResponse.json({ error: 'Telegram bot not configured on server' }, { status: 500 })
      await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id,
        text: TEST_MESSAGE,
        parse_mode: 'Markdown',
      })
    } else if (channel === 'whatsapp') {
      const accountSid = process.env.TWILIO_ACCOUNT_SID
      const authToken  = process.env.TWILIO_AUTH_TOKEN
      const from       = process.env.TWILIO_WHATSAPP_FROM
      if (!accountSid || !authToken || !from) {
        return NextResponse.json({ error: 'WhatsApp (Twilio) not configured on server' }, { status: 500 })
      }
      const plainText = TEST_MESSAGE.replace(/\*/g, '').replace(/_/g, '')
      await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        new URLSearchParams({ From: `whatsapp:${from}`, To: `whatsapp:${phone}`, Body: plainText }).toString(),
        {
          auth: { username: accountSid, password: authToken },
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      )
    } else {
      return NextResponse.json({ error: 'Unknown channel' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    const msg = err?.response?.data?.description ?? err?.response?.data?.message ?? err.message ?? 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
