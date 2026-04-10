import axios from 'axios'
import { supabaseAdmin } from '@/lib/supabase/admin'

async function sendTelegram(chatId: string, message: string, botToken: string): Promise<void> {
  if (!botToken || !chatId) return
  try {
    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    })
  } catch (err: any) {
    console.error('[Notify] Telegram error:', err?.response?.data?.description ?? err.message)
  }
}

async function sendWhatsApp(to: string, message: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken  = process.env.TWILIO_AUTH_TOKEN
  const from       = process.env.TWILIO_WHATSAPP_FROM

  if (!accountSid || !authToken || !from || !to) return

  try {
    await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      new URLSearchParams({ From: `whatsapp:${from}`, To: `whatsapp:${to}`, Body: message }).toString(),
      {
        auth: { username: accountSid, password: authToken },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    )
  } catch (err: any) {
    console.error('[Notify] WhatsApp error:', err?.response?.data?.message ?? err.message)
  }
}

export async function notifyFounder(customerId: string, message: string): Promise<void> {
  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('telegram_chat_id, telegram_bot_token, whatsapp_number, notification_channel')
    .eq('id', customerId)
    .single()

  if (!customer) return

  if (customer.notification_channel === 'telegram' && customer.telegram_chat_id) {
    const token = customer.telegram_bot_token || process.env.TELEGRAM_BOT_TOKEN || ''
    await sendTelegram(customer.telegram_chat_id, message, token)
  } else if (customer.notification_channel === 'whatsapp' && customer.whatsapp_number) {
    await sendWhatsApp(customer.whatsapp_number, message)
  }
}
