'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CustomerSettings {
  id: string
  name: string | null
  email: string
  telegram_bot_token: string | null
  telegram_chat_id: string | null
  notification_channel: 'telegram' | 'email'
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

export function SettingsForm() {
  const [customer, setCustomer] = useState<CustomerSettings | null>(null)
  const [mission, setMission] = useState<MissionSettings>({ vision: '', product_requirements: '', monetary_goals: '', timeline: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingMission, setSavingMission] = useState(false)
  const [testingTelegram, setTestingTelegram] = useState(false)
  const [telegramStatus, setTelegramStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [telegramError, setTelegramError] = useState<string | null>(null)
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [resetting, setResetting] = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: c } = await supabase.from('customers')
      .select('id, name, email, telegram_bot_token, telegram_chat_id, notification_channel, currency')
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
      name: customer.name, telegram_bot_token: customer.telegram_bot_token,
      telegram_chat_id: customer.telegram_chat_id,
      notification_channel: customer.notification_channel,
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
    if (!customer?.telegram_chat_id || !customer?.telegram_bot_token) return
    setTestingTelegram(true); setTelegramStatus('idle'); setTelegramError(null)
    const res = await fetch('/api/notifications/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: 'telegram',
        chat_id: customer.telegram_chat_id,
        bot_token: customer.telegram_bot_token,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setTelegramStatus('success')
      saveProfile()
    } else {
      setTelegramStatus('error')
      setTelegramError(data.error ?? 'Test failed')
    }
    setTestingTelegram(false)
  }

  async function resetAll() {
    if (!resetConfirm) {
      setResetConfirm(true)
      return
    }
    setResetting(true)
    const res = await fetch('/api/settings/reset', { method: 'POST' })
    if (res.ok) {
      setSaveMsg({ type: 'success', text: 'All data cleared. Refresh the page to start fresh.' })
    }
    setResetConfirm(false)
    setResetting(false)
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
              <option value="inr">INR ({'\u20b9'})</option>
            </select>
          </div>
          <SaveButton onClick={saveProfile} loading={saving} />
        </div>
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="Notifications" subtitle="Only your CEO Agent sends notifications \u2014 daily briefings, approvals, and critical updates.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

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
              <StatusBadge connected={!!(customer.telegram_chat_id && customer.telegram_bot_token)} />
            </div>

            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { n: '1', text: <>Open Telegram and search for <strong style={{ color: '#29b6f6' }}>@BotFather</strong></> },
                { n: '2', text: <>Send <code style={{ background: 'rgba(41,182,246,0.1)', color: '#29b6f6', padding: '1px 5px', borderRadius: 4, fontSize: 11 }}>/newbot</code> and follow the prompts to create your bot. Choose any name and username.</> },
                { n: '3', text: <>BotFather gives you a <strong style={{ color: '#eef2f8' }}>Bot Token</strong> (looks like <code style={{ fontSize: 11, color: '#8b98b4' }}>123456:ABC-DEF...</code>). Copy and paste it below.</> },
                { n: '4', text: <>Search for your new bot by username in Telegram and tap <strong style={{ color: '#29b6f6' }}>Start</strong>. This activates the bot so it can message you.</> },
                { n: '5', text: <>Search for <strong style={{ color: '#29b6f6' }}>@userinfobot</strong> on Telegram and send <code style={{ background: 'rgba(41,182,246,0.1)', color: '#29b6f6', padding: '1px 5px', borderRadius: 4, fontSize: 11 }}>/start</code>. It replies with your <strong style={{ color: '#eef2f8' }}>Chat ID</strong>.</> },
                { n: '6', text: <>Paste both below and click <strong style={{ color: '#eef2f8' }}>Test</strong>. Your CEO Agent will message you.</> },
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(41,182,246,0.12)', border: '1px solid rgba(41,182,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#29b6f6', flexShrink: 0 }}>{s.n}</span>
                  <span style={{ fontSize: 12, color: '#8b98b4', lineHeight: 1.6 }}>{s.text}</span>
                </div>
              ))}
            </div>

            {/* Bot token input */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4a566e', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Bot Token</div>
              <Input
                value={customer.telegram_bot_token ?? ''}
                onChange={v => setCustomer(p => p ? { ...p, telegram_bot_token: v } : p)}
                placeholder="123456789:AABBcc-your-bot-token-here"
              />
            </div>

            {/* Chat ID input + test */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4a566e', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Your Chat ID</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <Input
                    value={customer.telegram_chat_id ?? ''}
                    onChange={v => setCustomer(p => p ? { ...p, telegram_chat_id: v } : p)}
                    placeholder="e.g. 123456789"
                  />
                </div>
                <button
                  onClick={testTelegram}
                  disabled={testingTelegram || !customer.telegram_chat_id || !customer.telegram_bot_token}
                  style={{
                    padding: '10px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                    cursor: (customer.telegram_chat_id && customer.telegram_bot_token) ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
                    opacity: (customer.telegram_chat_id && customer.telegram_bot_token) ? 1 : 0.4,
                    background: 'rgba(41,182,246,0.1)', border: '1px solid rgba(41,182,246,0.25)', color: '#29b6f6',
                  }}
                >
                  {testingTelegram ? 'Sending\u2026' : 'Test'}
                </button>
              </div>
            </div>

            {telegramStatus === 'success' && <p style={{ fontSize: 12, color: '#22c55e', margin: 0 }}>✓ Test message sent — check your Telegram</p>}
            {telegramStatus === 'error' && <p style={{ fontSize: 12, color: '#f43f5e', margin: 0 }}>✗ {telegramError}</p>}
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

      {/* Danger Zone */}
      <SectionCard title="Danger Zone" subtitle="Permanently delete all agent activity and start from scratch. Your login and settings are preserved.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 12, color: '#8b98b4', lineHeight: 1.6 }}>
            This will delete: all chat messages, kanban cards, agent events, approvals, part-time deployments, and reset your mission briefing. Use this to start a fresh session with new goals.
          </p>
          <button
            onClick={resetAll}
            disabled={resetting}
            style={{
              padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              cursor: resetting ? 'not-allowed' : 'pointer', opacity: resetting ? 0.6 : 1,
              background: resetConfirm ? 'rgba(244,63,94,0.15)' : 'transparent',
              border: `1px solid ${resetConfirm ? 'rgba(244,63,94,0.5)' : '#253044'}`,
              color: resetConfirm ? '#f43f5e' : '#4a566e',
              transition: 'all 0.2s', alignSelf: 'flex-start',
            }}
          >
            {resetting ? 'Resetting\u2026' : resetConfirm ? 'Confirm \u2014 delete everything' : 'Reset All & Start Fresh'}
          </button>
          {resetConfirm && !resetting && (
            <p style={{ fontSize: 11, color: '#f43f5e' }}>
              Click again to confirm. This cannot be undone.
            </p>
          )}
        </div>
      </SectionCard>

    </div>
  )
}
