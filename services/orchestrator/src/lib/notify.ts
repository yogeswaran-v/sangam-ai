import axios from 'axios'

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN!

export async function sendTelegram(chatId: string, message: string): Promise<void> {
  if (!TELEGRAM_TOKEN || !chatId) return
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    })
  } catch (err: any) {
    console.error('[Notify] Telegram error:', err?.response?.data?.description ?? err.message)
  }
}

export async function sendWhatsApp(to: string, message: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken  = process.env.TWILIO_AUTH_TOKEN
  const from       = process.env.TWILIO_WHATSAPP_FROM // e.g. +14155238886

  if (!accountSid || !authToken || !from || !to) return

  try {
    await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      new URLSearchParams({
        From: `whatsapp:${from}`,
        To:   `whatsapp:${to}`,
        Body: message,
      }).toString(),
      {
        auth: { username: accountSid, password: authToken },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    )
  } catch (err: any) {
    console.error('[Notify] WhatsApp error:', err?.response?.data?.message ?? err.message)
  }
}

/** Only the CEO Agent should call this function. */
export async function notifyFounder(customerId: string, message: string): Promise<void> {
  const { supabase } = await import('./supabase')
  const { data: customer } = await supabase
    .from('customers')
    .select('telegram_chat_id, whatsapp_number, notification_channel')
    .eq('id', customerId)
    .single()

  if (!customer) return

  if (customer.notification_channel === 'telegram' && customer.telegram_chat_id) {
    await sendTelegram(customer.telegram_chat_id, message)
  } else if (customer.notification_channel === 'whatsapp' && customer.whatsapp_number) {
    await sendWhatsApp(customer.whatsapp_number, message)
  }
}

/** @deprecated Use notifyFounder instead */
export const notifyCustomer = notifyFounder
