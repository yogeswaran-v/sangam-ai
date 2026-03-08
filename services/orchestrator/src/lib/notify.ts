import axios from 'axios'

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN!

export async function sendTelegram(chatId: string, message: string): Promise<void> {
  if (!TELEGRAM_TOKEN || !chatId) return
  await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    chat_id: chatId,
    text: message,
    parse_mode: 'Markdown',
  })
}

export async function notifyCustomer(customerId: string, message: string): Promise<void> {
  const { data: customer } = await import('./supabase').then(m =>
    m.supabase
      .from('customers')
      .select('telegram_chat_id, notification_channel')
      .eq('id', customerId)
      .single()
  )

  if (!customer) return

  if (customer.notification_channel === 'telegram' && customer.telegram_chat_id) {
    await sendTelegram(customer.telegram_chat_id, message)
  }
}
