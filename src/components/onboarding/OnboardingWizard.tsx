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

const MAX_LENGTH = 2000

export function OnboardingWizard() {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitProgress, setSubmitProgress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const progress = ((step + 1) / STEPS.length) * 100
  const currentValue = values[current.field] ?? ''

  function handleChange(value: string) {
    if (value.length <= MAX_LENGTH) {
      setValues(prev => ({ ...prev, [current.field]: value }))
    }
  }

  function handleBack() {
    setError(null)
    setStep(s => s - 1)
  }

  async function handleNext() {
    if (isLast) {
      await handleSubmit()
    } else {
      setError(null)
      setStep(s => s + 1)
    }
  }

  async function handleSubmit() {
    setLoading(true)
    setSubmitting(true)
    setError(null)

    try {
      setSubmitProgress('Assembling your AI team...')

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
        setLoading(false)
        setSubmitting(false)
        return
      }

      setSubmitProgress('Launching your dashboard...')
      router.push('/dashboard')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      setSubmitting(false)
    }
  }

  // Full-page loading overlay during submission
  if (submitting) {
    return (
      <div className="w-full max-w-xl flex flex-col items-center gap-6 py-20">
        <div className="w-16 h-16 border-4 border-[#1e1e2e] border-t-[#6366f1] rounded-full animate-spin" />
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Setting up your team</h2>
          <p className="text-[#6b7280] text-sm">{submitProgress}</p>
        </div>
        {error && (
          <div className="px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm max-w-md text-center">
            {error}
            <button
              onClick={() => { setSubmitting(false); setLoading(false) }}
              className="block mx-auto mt-2 text-white underline text-xs"
            >
              Go back to form
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl">
      {/* Progress */}
      <div className="mb-10">
        <div className="flex items-center justify-between text-xs text-[#6b7280] mb-3">
          <span>Step {step + 1} of {STEPS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1 bg-[#1e1e2e] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#6366f1] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">{current.title}</h2>
          <p className="text-[#6b7280] text-sm">{current.subtitle}</p>
        </div>

        <div className="relative">
          <textarea
            key={current.id}
            value={currentValue}
            onChange={e => handleChange(e.target.value)}
            placeholder={current.placeholder}
            rows={6}
            maxLength={MAX_LENGTH}
            className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl text-white placeholder-[#4b5563] focus:border-[#6366f1] outline-none text-sm resize-none transition-colors"
          />
          <span className="absolute bottom-3 right-3 text-xs text-[#4b5563]">
            {currentValue.length}/{MAX_LENGTH}
          </span>
        </div>

        {error && (
          <div className="mt-3 px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handleBack}
            className={`px-4 py-2 text-sm text-[#6b7280] hover:text-white transition-colors ${step === 0 ? 'invisible' : ''}`}
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            disabled={loading || !currentValue.trim()}
            className="px-6 py-2.5 bg-[#6366f1] text-white rounded-xl hover:bg-[#818cf8] transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {loading ? 'Saving...' : isLast ? 'Launch my team' : 'Next →'}
          </button>
        </div>
      </div>

      <p className="text-center text-[#4b5563] text-xs mt-6">
        Your answers help the CEO Agent understand your mission.
      </p>
    </div>
  )
}
