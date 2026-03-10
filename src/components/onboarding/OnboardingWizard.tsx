'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STEPS = [
  {
    id: 'vision',
    title: 'What is your vision?',
    subtitle: 'Describe the world you want to create — in 10 years.',
    field: 'vision',
    placeholder: 'e.g. Every small business in India has an AI team running operations...',
  },
  {
    id: 'product',
    title: 'What are you building?',
    subtitle: 'Describe your product or service in detail.',
    field: 'product_requirements',
    placeholder: 'e.g. A SaaS platform for...',
  },
  {
    id: 'goals',
    title: 'What are your monetary goals?',
    subtitle: 'Revenue targets, milestones, or financial outcomes.',
    field: 'monetary_goals',
    placeholder: 'e.g. $10K MRR in 6 months, profitable in 12 months...',
  },
  {
    id: 'timeline',
    title: 'What is your timeline?',
    subtitle: 'Key deadlines, launch dates, or milestones.',
    field: 'timeline',
    placeholder: 'e.g. MVP in 4 weeks, beta launch in 8 weeks...',
  },
]

const AGENTS = [
  { id: 'ceo',      name: 'CEO Agent',       role: 'Strategy & delegation',          color: '#a78bfa' },
  { id: 'product',  name: 'Product Agent',    role: 'Roadmap & kanban',               color: '#38bdf8' },
  { id: 'engineer', name: 'Engineer Agent',   role: 'Code & architecture',            color: '#4ade80' },
  { id: 'market',   name: 'Marketing Agent',  role: 'Content, SEO, campaigns',        color: '#fb923c' },
  { id: 'sales',    name: 'Sales Agent',      role: 'Outreach & CRM',                 color: '#f472b6' },
  { id: 'finance',  name: 'Finance Agent',    role: 'Budgets & forecasts',            color: '#14b8a6' },
]

const MAX_LENGTH = 2000

// ─── Activating state shows agents coming online one by one ───
const ACTIVATION_SEQUENCE = [
  'Saving your mission brief…',
  'Assembling CEO Agent…',
  'Assembling Product Agent…',
  'Assembling Engineering Agent…',
  'Assembling Marketing Agent…',
  'Assembling Sales Agent…',
  'Assembling Finance Agent…',
  'Activating your command centre…',
]

export function OnboardingWizard() {
  const [step, setStep] = useState(0)              // 0-3 = form steps, 4 = launch review
  const [values, setValues] = useState<Record<string, string>>({})
  const [activating, setActivating] = useState(false)
  const [activationStep, setActivationStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const isReviewStep = step === STEPS.length
  const current = STEPS[step]
  const progress = isReviewStep ? 100 : ((step + 1) / STEPS.length) * 100
  const currentValue = current ? (values[current.field] ?? '') : ''

  function handleChange(value: string) {
    if (current && value.length <= MAX_LENGTH) {
      setValues(prev => ({ ...prev, [current.field]: value }))
    }
  }

  function handleBack() {
    setError(null)
    setStep(s => s - 1)
  }

  function handleNext() {
    setError(null)
    setStep(s => s + 1)
  }

  async function handleActivate() {
    setActivating(true)
    setError(null)
    setActivationStep(0)

    // Step through activation messages
    for (let i = 0; i < ACTIVATION_SEQUENCE.length; i++) {
      setActivationStep(i)
      await new Promise(r => setTimeout(r, 500))
    }

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vision: values.vision ?? '',
          product_requirements: values.product_requirements ?? '',
          monetary_goals: values.monetary_goals ?? '',
          timeline: values.timeline ?? '',
        }),
        credentials: 'include',
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        setError(result.error ?? 'Something went wrong. Please try again.')
        setActivating(false)
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
      setActivating(false)
    }
  }

  // ─── Activating screen ───
  if (activating) {
    return (
      <div className="w-full max-w-lg flex flex-col items-center gap-8 py-16 px-4">
        {/* Animated ring */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-2 animate-spin"
            style={{ borderColor: 'transparent', borderTopColor: '#a78bfa', borderRightColor: 'rgba(167,139,250,0.3)', animationDuration: '1s' }} />
          <div className="absolute inset-2 rounded-full border border-[#1a2236]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-[#a78bfa]" style={{ boxShadow: '0 0 12px rgba(167,139,250,0.8)' }} />
          </div>
        </div>

        {/* Progress text */}
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-bricolage)', color: '#eef2f8' }}>
            Activating your team
          </h2>
          <p className="text-sm font-medium transition-all duration-300" style={{ color: '#8b98b4' }}>
            {ACTIVATION_SEQUENCE[Math.min(activationStep, ACTIVATION_SEQUENCE.length - 1)]}
          </p>
        </div>

        {/* Agent activation bars */}
        <div className="w-full flex flex-col gap-2">
          {AGENTS.map((agent, i) => {
            const agentStep = i + 1  // agent 0 activates at activationStep 1, etc.
            const done = activationStep > agentStep
            const active = activationStep === agentStep
            return (
              <div key={agent.id}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300"
                style={{
                  background: done || active ? `${agent.color}08` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${done || active ? agent.color + '25' : '#1a2236'}`,
                  opacity: done || active ? 1 : 0.4,
                }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300"
                  style={{
                    background: done ? agent.color : active ? agent.color : '#253044',
                    boxShadow: (done || active) ? `0 0 6px ${agent.color}80` : 'none',
                  }} />
                <span className="text-[13px] font-medium flex-1"
                  style={{ color: done || active ? '#eef2f8' : '#4a566e', fontFamily: 'var(--font-bricolage)' }}>
                  {agent.name}
                </span>
                {done && (
                  <span className="text-[11px] font-semibold" style={{ color: agent.color }}>Online</span>
                )}
                {active && (
                  <span className="text-[11px]" style={{ color: '#4a566e' }}>
                    <span className="animate-pulse">Initialising…</span>
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {error && (
          <div className="w-full px-4 py-3 rounded-xl text-[13px]"
            style={{ background: 'rgba(248,65,65,0.08)', border: '1px solid rgba(248,65,65,0.2)', color: '#f87171' }}>
            {error}
            <button onClick={() => setActivating(false)}
              className="block mt-2 underline text-[11px] cursor-pointer">
              Go back and try again
            </button>
          </div>
        )}
      </div>
    )
  }

  // ─── Launch review screen ───
  if (isReviewStep) {
    return (
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[12px] font-semibold" style={{ color: '#4ade80' }}>Ready to launch</span>
          </div>
          <h2 className="text-3xl font-extrabold mb-2" style={{ fontFamily: 'var(--font-bricolage)', color: '#eef2f8' }}>
            Your team is assembled.
          </h2>
          <p className="text-[14px]" style={{ color: '#8b98b4' }}>
            Review your mission brief, then activate your AI company.
          </p>
        </div>

        {/* Mission summary */}
        <div className="rounded-2xl p-5 mb-5"
          style={{ background: '#0b1018', border: '1px solid #1a2236' }}>
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] mb-4"
            style={{ color: '#4a566e', fontFamily: 'var(--font-bricolage)' }}>
            Mission Brief
          </div>
          <div className="grid grid-cols-1 gap-3">
            {STEPS.map(s => (
              <div key={s.id} className="rounded-xl p-3" style={{ background: '#101620', border: '1px solid #1a2236' }}>
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] mb-1.5" style={{ color: '#4a566e' }}>
                  {s.title.replace('?', '')}
                </div>
                <p className="text-[13px] leading-relaxed line-clamp-2" style={{ color: values[s.field] ? '#8b98b4' : '#2e3b52' }}>
                  {values[s.field] || <span style={{ color: '#2e3b52' }}>Not provided</span>}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Agent team */}
        <div className="rounded-2xl p-5 mb-6"
          style={{ background: '#0b1018', border: '1px solid #1a2236' }}>
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] mb-4"
            style={{ color: '#4a566e', fontFamily: 'var(--font-bricolage)' }}>
            Your 6-agent team
          </div>
          <div className="grid grid-cols-2 gap-2">
            {AGENTS.map(agent => (
              <div key={agent.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                style={{ background: '#101620', border: '1px solid #1a2236' }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: agent.color, boxShadow: `0 0 5px ${agent.color}80` }} />
                <div>
                  <div className="text-[12px] font-semibold" style={{ color: '#eef2f8', fontFamily: 'var(--font-bricolage)' }}>
                    {agent.name}
                  </div>
                  <div className="text-[10px]" style={{ color: '#4a566e' }}>{agent.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important notice */}
        <div className="flex gap-3 p-4 rounded-xl mb-6"
          style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)' }}>
          <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-[12px] leading-relaxed" style={{ color: '#8b98b4' }}>
            Once activated, your agents begin working immediately. The orchestrator runs every 30 seconds — expect your first agent messages within 1 minute.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button onClick={handleBack}
            className="px-5 py-3 text-[13px] font-medium transition-colors cursor-pointer rounded-xl"
            style={{ color: '#8b98b4', border: '1px solid #1a2236', background: 'transparent' }}>
            ← Edit answers
          </button>
          <button onClick={handleActivate}
            className="flex-1 py-3.5 rounded-xl text-[15px] font-bold text-white transition-all duration-200 cursor-pointer"
            style={{ background: '#7c3aed', boxShadow: '0 0 28px rgba(124,58,237,0.5), 0 4px 12px rgba(0,0,0,0.3)' }}>
            Activate your team →
          </button>
        </div>
      </div>
    )
  }

  // ─── Form steps 0–3 ───
  return (
    <div className="w-full max-w-xl">
      {/* Progress */}
      <div className="mb-10">
        <div className="flex items-center justify-between text-[12px] mb-3 font-medium" style={{ color: '#4a566e' }}>
          <span>Step {step + 1} of {STEPS.length}</span>
          <span className="tabular-nums">{Math.round(progress)}%</span>
        </div>
        <div className="h-0.5 rounded-full overflow-hidden" style={{ background: '#1a2236' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
              boxShadow: '0 0 8px rgba(124,58,237,0.5)',
            }}
          />
        </div>
        <div className="flex gap-2 mt-3">
          {STEPS.map((_, i) => (
            <div key={i} className="h-0.5 flex-1 rounded-full transition-all duration-300"
              style={{ background: i <= step ? '#7c3aed' : '#1a2236' }} />
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl p-8 transition-colors duration-300"
        style={{ background: '#0b1018', border: '1px solid #1a2236' }}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-bricolage)', color: '#eef2f8' }}>
            {current.title}
          </h2>
          <p className="text-[14px]" style={{ color: '#8b98b4' }}>{current.subtitle}</p>
        </div>

        <div className="relative">
          <textarea
            key={current.id}
            value={currentValue}
            onChange={e => handleChange(e.target.value)}
            placeholder={current.placeholder}
            rows={6}
            maxLength={MAX_LENGTH}
            className="w-full px-4 py-3 rounded-xl text-[14px] outline-none resize-none transition-all duration-200"
            style={{
              background: '#101620',
              border: '1px solid #1a2236',
              color: '#eef2f8',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.08)'
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = '#1a2236'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
          <span className="absolute bottom-3 right-3 text-[11px] tabular-nums" style={{ color: '#2e3b52' }}>
            {currentValue.length}/{MAX_LENGTH}
          </span>
        </div>

        {error && (
          <div className="mt-3 px-4 py-3 rounded-xl text-[13px]"
            style={{ background: 'rgba(248,65,65,0.08)', border: '1px solid rgba(248,65,65,0.2)', color: '#f87171' }}>
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <button onClick={handleBack}
            className={`px-4 py-2 text-[13px] transition-colors cursor-pointer ${step === 0 ? 'invisible' : ''}`}
            style={{ color: '#8b98b4' }}>
            ← Back
          </button>
          <button
            onClick={handleNext}
            disabled={!currentValue.trim()}
            className="px-6 py-2.5 rounded-xl text-[14px] font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            style={{ background: '#7c3aed', boxShadow: '0 0 16px rgba(124,58,237,0.3)' }}
          >
            {step === STEPS.length - 1 ? 'Review & Launch →' : 'Next →'}
          </button>
        </div>
      </div>

      <p className="text-center text-[12px] mt-5" style={{ color: '#2e3b52' }}>
        Your answers help the CEO Agent understand your mission.
      </p>
    </div>
  )
}
