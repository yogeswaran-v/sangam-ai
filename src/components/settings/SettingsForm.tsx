'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CustomerSettings {
  id: string
  name: string | null
  email: string
  telegram_chat_id: string | null
  whatsapp_number: string | null
  notification_channel: 'telegram' | 'whatsapp' | 'email'
  currency: 'usd' | 'inr'
}

interface MissionSettings {
  vision: string
  product_requirements: string
  monetary_goals: string
  timeline: string
}

export function SettingsForm() {
  const [customer, setCustomer] = useState<CustomerSettings | null>(null)
  const [mission, setMission] = useState<MissionSettings>({
    vision: '', product_requirements: '', monetary_goals: '', timeline: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingMission, setSavingMission] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: c } = await supabase
      .from('customers')
      .select('id, name, email, telegram_chat_id, whatsapp_number, notification_channel, currency')
      .eq('user_id', user.id)
      .single()

    if (c) {
      setCustomer(c as CustomerSettings)

      const { data: mc } = await supabase
        .from('mission_control')
        .select('vision, product_requirements, monetary_goals, timeline')
        .eq('customer_id', c.id)
        .single()

      if (mc) {
        setMission({
          vision: mc.vision ?? '',
          product_requirements: mc.product_requirements ?? '',
          monetary_goals: mc.monetary_goals ?? '',
          timeline: mc.timeline ?? '',
        })
      }
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchData() }, [fetchData])

  async function saveProfile() {
    if (!customer) return
    setSaving(true)
    setMessage(null)
    const { error } = await supabase
      .from('customers')
      .update({
        name: customer.name,
        telegram_chat_id: customer.telegram_chat_id,
        whatsapp_number: customer.whatsapp_number,
        notification_channel: customer.notification_channel,
        currency: customer.currency,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customer.id)

    setMessage(error
      ? { type: 'error', text: error.message }
      : { type: 'success', text: 'Profile saved.' }
    )
    setSaving(false)
  }

  async function saveMission() {
    if (!customer) return
    setSavingMission(true)
    setMessage(null)
    const { error } = await supabase
      .from('mission_control')
      .upsert({
        customer_id: customer.id,
        ...mission,
        updated_by: 'ceo',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'customer_id' })

    setMessage(error
      ? { type: 'error', text: error.message }
      : { type: 'success', text: 'Mission updated. Agents will adapt.' }
    )
    setSavingMission(false)
  }

  if (loading) {
    return <div className="text-[#6b7280] text-sm py-16 text-center">Loading...</div>
  }

  if (!customer) {
    return <div className="text-[#6b7280] text-sm py-16 text-center">Complete onboarding first.</div>
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {message && (
        <div className={`px-4 py-3 rounded-lg border text-sm ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile section */}
      <section className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-white">Profile</h3>

        <div>
          <label className="text-xs text-[#6b7280] block mb-2">Display name</label>
          <input
            type="text"
            value={customer.name ?? ''}
            onChange={e => setCustomer(prev => prev ? { ...prev, name: e.target.value } : prev)}
            placeholder="Your name"
            className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl text-white placeholder-[#4b5563] focus:border-[#6366f1] outline-none text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-[#6b7280] block mb-2">Email</label>
          <input
            type="email"
            value={customer.email}
            disabled
            className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl text-[#6b7280] outline-none text-sm cursor-not-allowed"
          />
        </div>

        <div>
          <label className="text-xs text-[#6b7280] block mb-2">Currency</label>
          <select
            value={customer.currency}
            onChange={e => setCustomer(prev => prev ? { ...prev, currency: e.target.value as 'usd' | 'inr' } : prev)}
            className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl text-white focus:border-[#6366f1] outline-none text-sm"
          >
            <option value="usd">USD ($)</option>
            <option value="inr">INR (&#8377;)</option>
          </select>
        </div>
      </section>

      {/* Notifications section */}
      <section className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-white">Notifications</h3>

        <div>
          <label className="text-xs text-[#6b7280] block mb-2">Notification channel</label>
          <div className="flex gap-3">
            {(['telegram', 'whatsapp', 'email'] as const).map(ch => (
              <button
                key={ch}
                onClick={() => setCustomer(prev => prev ? { ...prev, notification_channel: ch } : prev)}
                className={`flex-1 py-2.5 rounded-xl text-sm border transition-colors capitalize ${
                  customer.notification_channel === ch
                    ? 'bg-[#6366f1]/15 border-[#6366f1]/50 text-white'
                    : 'bg-[#0a0a0f] border-[#1e1e2e] text-[#6b7280] hover:text-white'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        {customer.notification_channel === 'telegram' && (
          <div>
            <label className="text-xs text-[#6b7280] block mb-2">Telegram Chat ID</label>
            <input
              type="text"
              value={customer.telegram_chat_id ?? ''}
              onChange={e => setCustomer(prev => prev ? { ...prev, telegram_chat_id: e.target.value } : prev)}
              placeholder="Your Telegram chat ID (e.g. 123456789)"
              className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl text-white placeholder-[#4b5563] focus:border-[#6366f1] outline-none text-sm"
            />
            <p className="text-xs text-[#4b5563] mt-2">
              Message @userinfobot on Telegram to get your chat ID.
            </p>
          </div>
        )}

        {customer.notification_channel === 'whatsapp' && (
          <div>
            <label className="text-xs text-[#6b7280] block mb-2">WhatsApp Number</label>
            <input
              type="tel"
              value={customer.whatsapp_number ?? ''}
              onChange={e => setCustomer(prev => prev ? { ...prev, whatsapp_number: e.target.value } : prev)}
              placeholder="+91 9999999999"
              className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl text-white placeholder-[#4b5563] focus:border-[#6366f1] outline-none text-sm"
            />
          </div>
        )}

        <button
          onClick={saveProfile}
          disabled={saving}
          className="px-5 py-2.5 bg-[#6366f1] text-white rounded-xl text-sm hover:bg-[#818cf8] transition-colors disabled:opacity-50 font-medium"
        >
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </section>

      {/* Mission Control section */}
      <section className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6 space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-white">Mission Control</h3>
          <p className="text-xs text-[#6b7280] mt-1">Update your company vision and goals. Agents will adapt.</p>
        </div>

        {([
          { field: 'vision', label: 'Vision', placeholder: 'Your 10-year vision...' },
          { field: 'product_requirements', label: 'Product', placeholder: 'What you are building...' },
          { field: 'monetary_goals', label: 'Monetary goals', placeholder: 'Revenue targets...' },
          { field: 'timeline', label: 'Timeline', placeholder: 'Key milestones...' },
        ] as { field: keyof MissionSettings; label: string; placeholder: string }[]).map(item => (
          <div key={item.field}>
            <label className="text-xs text-[#6b7280] block mb-2">{item.label}</label>
            <textarea
              value={mission[item.field]}
              onChange={e => setMission(prev => ({ ...prev, [item.field]: e.target.value }))}
              placeholder={item.placeholder}
              rows={3}
              className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl text-white placeholder-[#4b5563] focus:border-[#6366f1] outline-none text-sm resize-none"
            />
          </div>
        ))}

        <button
          onClick={saveMission}
          disabled={savingMission}
          className="px-5 py-2.5 bg-[#6366f1] text-white rounded-xl text-sm hover:bg-[#818cf8] transition-colors disabled:opacity-50 font-medium"
        >
          {savingMission ? 'Updating...' : 'Update mission'}
        </button>
      </section>
    </div>
  )
}
