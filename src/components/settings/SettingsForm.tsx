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

const input = {
  base: {
    background: '#101620',
    border: '1px solid #1a2236',
    borderRadius: 12,
    color: '#eef2f8',
    padding: '10px 14px',
    fontSize: 13,
    outline: 'none',
    width: '100%',
  } as React.CSSProperties,
}

function Input({
  value, onChange, placeholder, type = 'text', disabled,
}: {
  value: string; onChange?: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        ...input.base,
        borderColor: focused ? 'rgba(124,58,237,0.5)' : '#1a2236',
        boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.08)' : 'none',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'text',
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        ...input.base,
        resize: 'none',
        borderColor: focused ? 'rgba(124,58,237,0.5)' : '#1a2236',
        boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.08)' : 'none',
      } as React.CSSProperties}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section style={{ background: '#0b1018', border: '1px solid #1a2236', borderRadius: 16, padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-bricolage)', fontSize: 15, fontWeight: 700, color: '#eef2f8', margin: 0 }}>
          {title}
        </h3>
        {subtitle && <p style={{ fontSize: 12, color: '#4a566e', marginTop: 4 }}>{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 600, color: '#4a566e', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{children}</div>
}

function SaveButton({ onClick, loading, label = 'Save' }: { onClick: () => void; loading: boolean; label?: string }) {
  return (
    <button onClick={onClick} disabled={loading}
      style={{ background: '#7c3aed', color: 'white', border: 'none', borderRadius: 10, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
      {loading ? 'Saving\u2026' : label}
    </button>
  )
}

function StatusBadge({ connected }: { connected: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: connected ? '#22c55e' : '#4a566e' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: connected ? '#22c55e' : '#253044', display: 'inline-block', boxShadow: connected ? '0 0 5px rgba(34,197,94,0.6)' : 'none' }} />
      {connected ? 'Connected' : 'Not connected'}
    </div>
  )
}

// Telegram icon SVG
const TelegramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
  </svg>
)

// WhatsApp icon SVG
const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

export function SettingsForm() {
  const [customer, setCustomer] = useState<CustomerSettings | null>(null)
  const [mission, setMission] = useState<MissionSettings>({ vision: '', product_requirements: '', monetary_goals: '', timeline: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingMission, setSavingMission] = useState(false)
  const [testingTelegram, setTestingTelegram] = useState(false)
  const [testingWhatsApp, setTestingWhatsApp] = useState(false)
  const [telegramStatus, setTelegramStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [whatsappStatus, setWhatsappStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [telegramError, setTelegramError] = useState<string | null>(null)
  const [whatsappError, setWhatsappError] = useState<string | null>(null)
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: c } = await supabase.from('customers')
      .select('id, name, email, telegram_chat_id, whatsapp_number, notification_channel, currency')
      .eq('user_id', user.id).single()
    if (c) {
      setCustomer(c as CustomerSettings)
      const { data: mc } = await supabase.from('mission_control')
        .select('vision, product_requirements, monetary_goals, timeline')
        .eq('customer_id', c.id).single()
      if (mc) setMission({ vision: mc.vision ?? '', product_requirements: mc.product_requirements ?? '', monetary_goals: mc.monetary_goals ?? '', timeline: mc.timeline ?? '' })
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchData() }, [fetchData])

  async function saveProfile() {
    if (!customer) return
    setSaving(true); setSaveMsg(null)
    const { error } = await supabase.from('customers').update({
      name: customer.name, telegram_chat_id: customer.telegram_chat_id,
      whatsapp_number: customer.whatsapp_number, notification_channel: customer.notification_channel,
      currency: customer.currency, updated_at: new Date().toISOString(),
    }).eq('id', customer.id)
    setSaveMsg(error ? { type: 'error', text: error.message } : { type: 'success', text: 'Settings saved.' })
    setSaving(false)
  }

  async function saveMission() {
    if (!customer) return
    setSavingMission(true); setSaveMsg(null)
    const { error } = await supabase.from('mission_control').upsert({
      customer_id: customer.id, ...mission, updated_by: 'ceo', updated_at: new Date().toISOString(),
    }, { onConflict: 'customer_id' })
    setSaveMsg(error ? { type: 'error', text: error.message } : { type: 'success', text: 'Mission updated. Agents will adapt on next cycle.' })
    setSavingMission(false)
  }

  async function testTelegram() {
    if (!customer?.telegram_chat_id) return
    setTestingTelegram(true); setTelegramStatus('idle'); setTelegramError(null)
    const res = await fetch('/api/notifications/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: 'telegram', chat_id: customer.telegram_chat_id }),
    })
    const data = await res.json()
    setTelegramStatus(res.ok ? 'success' : 'error')
    if (!res.ok) setTelegramError(data.error ?? 'Test failed')
    setTestingTelegram(false)
  }

  async function testWhatsApp() {
    if (!customer?.whatsapp_number) return
    setTestingWhatsApp(true); setWhatsappStatus('idle'); setWhatsappError(null)
    const res = await fetch('/api/notifications/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: 'whatsapp', phone: customer.whatsapp_number }),
    })
    const data = await res.json()
    setWhatsappStatus(res.ok ? 'success' : 'error')
    if (!res.ok) setWhatsappError(data.error ?? 'Test failed')
    setTestingWhatsApp(false)
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '64px 0', fontSize: 13, color: '#4a566e' }}>Loading\u2026</div>
  if (!customer) return <div style={{ textAlign: 'center', padding: '64px 0', fontSize: 13, color: '#4a566e' }}>Complete onboarding first.</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>

      {/* Global save message */}
      {saveMsg && (
        <div style={{
          padding: '10px 14px', borderRadius: 10, fontSize: 13,
          background: saveMsg.type === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(244,63,94,0.08)',
          border: `1px solid ${saveMsg.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(244,63,94,0.2)'}`,
          color: saveMsg.type === 'success' ? '#22c55e' : '#f43f5e',
        }}>
          {saveMsg.text}
        </div>
      )}

      {/* Profile */}
      <SectionCard title="Profile">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Label>Display name</Label>
            <Input value={customer.name ?? ''} onChange={v => setCustomer(p => p ? { ...p, name: v } : p)} placeholder="Your name" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={customer.email} disabled />
          </div>
          <div>
            <Label>Currency preference</Label>
            <select
              value={customer.currency}
              onChange={e => setCustomer(p => p ? { ...p, currency: e.target.value as 'usd' | 'inr' } : p)}
              style={{ ...input.base, cursor: 'pointer' }}
            >
              <option value="usd">USD ($)</option>
              <option value="inr">INR (\u20b9)</option>
            </select>
          </div>
          <SaveButton onClick={saveProfile} loading={saving} />
        </div>
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="Notifications" subtitle="Only your CEO Agent sends notifications \u2014 daily briefings, approvals, and critical updates.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Channel selector */}
          <div>
            <Label>Active channel</Label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['telegram', 'whatsapp'] as const).map(ch => (
                <button key={ch} onClick={() => setCustomer(p => p ? { ...p, notification_channel: ch } : p)}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    background: customer.notification_channel === ch ? 'rgba(124,58,237,0.12)' : 'transparent',
                    border: `1px solid ${customer.notification_channel === ch ? 'rgba(167,139,250,0.3)' : '#1a2236'}`,
                    color: customer.notification_channel === ch ? '#eef2f8' : '#4a566e',
                  }}>
                  {ch.charAt(0).toUpperCase() + ch.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Telegram card */}
          <div style={{
            background: '#101620', border: `1px solid ${customer.notification_channel === 'telegram' ? 'rgba(41,182,246,0.2)' : '#1a2236'}`,
            borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(41,182,246,0.1)', border: '1px solid rgba(41,182,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#29b6f6' }}>
                  <TelegramIcon />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#eef2f8', fontFamily: 'var(--font-bricolage)' }}>Telegram</div>
                  <div style={{ fontSize: 11, color: '#4a566e' }}>Bot notifications</div>
                </div>
              </div>
              <StatusBadge connected={!!customer.telegram_chat_id} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { step: '1', text: 'Open Telegram and search for your bot' },
                { step: '2', text: 'Send /start \u2014 the bot replies with your Chat ID' },
                { step: '3', text: 'Paste your Chat ID below and test' },
              ].map(s => (
                <div key={s.step} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(41,182,246,0.12)', border: '1px solid rgba(41,182,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#29b6f6', flexShrink: 0 }}>{s.step}</span>
                  <span style={{ fontSize: 12, color: '#8b98b4', lineHeight: 1.5 }}>{s.text}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <Input value={customer.telegram_chat_id ?? ''} onChange={v => setCustomer(p => p ? { ...p, telegram_chat_id: v } : p)} placeholder="e.g. 123456789" />
              </div>
              <button onClick={testTelegram} disabled={testingTelegram || !customer.telegram_chat_id}
                style={{ padding: '10px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: customer.telegram_chat_id ? 'pointer' : 'not-allowed', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0, opacity: customer.telegram_chat_id ? 1 : 0.4, background: 'rgba(41,182,246,0.1)', border: '1px solid rgba(41,182,246,0.25)', color: '#29b6f6' }}>
                {testingTelegram ? 'Sending\u2026' : 'Test'}
              </button>
            </div>
            {telegramStatus === 'success' && <p style={{ fontSize: 12, color: '#22c55e', margin: 0 }}>\u2713 Test message sent successfully</p>}
            {telegramStatus === 'error' && <p style={{ fontSize: 12, color: '#f43f5e', margin: 0 }}>\u2717 {telegramError}</p>}
          </div>

          {/* WhatsApp card */}
          <div style={{
            background: '#101620', border: `1px solid ${customer.notification_channel === 'whatsapp' ? 'rgba(37,211,102,0.2)' : '#1a2236'}`,
            borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25d366' }}>
                  <WhatsAppIcon />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#eef2f8', fontFamily: 'var(--font-bricolage)' }}>WhatsApp</div>
                  <div style={{ fontSize: 11, color: '#4a566e' }}>Via Twilio sandbox</div>
                </div>
              </div>
              <StatusBadge connected={!!customer.whatsapp_number} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { step: '1', text: 'Send "join <sandbox-code>" to +1 415 523 8886 on WhatsApp' },
                { step: '2', text: "You'll receive a confirmation from Twilio" },
                { step: '3', text: 'Add your number below (with country code) and test' },
              ].map(s => (
                <div key={s.step} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#25d366', flexShrink: 0 }}>{s.step}</span>
                  <span style={{ fontSize: 12, color: '#8b98b4', lineHeight: 1.5 }}>{s.text}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <Input value={customer.whatsapp_number ?? ''} onChange={v => setCustomer(p => p ? { ...p, whatsapp_number: v } : p)} placeholder="+91 9999999999" type="tel" />
              </div>
              <button onClick={testWhatsApp} disabled={testingWhatsApp || !customer.whatsapp_number}
                style={{ padding: '10px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: customer.whatsapp_number ? 'pointer' : 'not-allowed', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0, opacity: customer.whatsapp_number ? 1 : 0.4, background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)', color: '#25d366' }}>
                {testingWhatsApp ? 'Sending\u2026' : 'Test'}
              </button>
            </div>
            {whatsappStatus === 'success' && <p style={{ fontSize: 12, color: '#22c55e', margin: 0 }}>\u2713 Test message sent successfully</p>}
            {whatsappStatus === 'error' && <p style={{ fontSize: 12, color: '#f43f5e', margin: 0 }}>\u2717 {whatsappError}</p>}
          </div>

          <SaveButton onClick={saveProfile} loading={saving} label="Save notification settings" />
        </div>
      </SectionCard>

      {/* Mission Control */}
      <SectionCard title="Mission Control" subtitle="Update your company vision and goals. Agents will adapt on the next orchestration cycle.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {([
            { field: 'vision', label: 'Vision', placeholder: 'Your 10-year vision...' },
            { field: 'product_requirements', label: 'Product', placeholder: 'What you are building...' },
            { field: 'monetary_goals', label: 'Monetary goals', placeholder: 'Revenue targets...' },
            { field: 'timeline', label: 'Timeline', placeholder: 'Key milestones...' },
          ] as { field: keyof MissionSettings; label: string; placeholder: string }[]).map(item => (
            <div key={item.field}>
              <Label>{item.label}</Label>
              <Textarea value={mission[item.field]} onChange={v => setMission(p => ({ ...p, [item.field]: v }))} placeholder={item.placeholder} />
            </div>
          ))}
          <SaveButton onClick={saveMission} loading={savingMission} label="Update mission" />
        </div>
      </SectionCard>

    </div>
  )
}
