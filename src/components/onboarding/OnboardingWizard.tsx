'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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

export function OnboardingWizard() {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const progress = ((step + 1) / STEPS.length) * 100

  function handleChange(value: string) {
    setValues(prev => ({ ...prev, [current.field]: value }))
  }

  async function handleNext() {
    if (isLast) {
      await handleSubmit()
    } else {
      setStep(s => s + 1)
    }
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    // Get or create customer record
    let { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!customer) {
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert({ user_id: user.id, email: user.email ?? '' })
        .select('id')
        .single()

      if (createError) {
        setError(createError.message)
        setLoading(false)
        return
      }
      customer = newCustomer
    }

    // Upsert mission control
    const { error: mcError } = await supabase
      .from('mission_control')
      .upsert({
        customer_id: customer!.id,
        vision: values.vision ?? '',
        product_requirements: values.product_requirements ?? '',
        monetary_goals: values.monetary_goals ?? '',
        timeline: values.timeline ?? '',
        updated_by: 'ceo',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'customer_id' })

    if (mcError) {
      setError(mcError.message)
      setLoading(false)
      return
    }

    // Mark onboarding complete on agent_teams
    await supabase
      .from('agent_teams')
      .upsert({
        customer_id: customer!.id,
        team_type: 'startup_product',
        status: 'active',
        onboarding_complete: true,
      }, { onConflict: 'customer_id' })

    // Create kanban board
    const { data: kanbanBoard } = await supabase
      .from('kanban_boards')
      .upsert({ customer_id: customer!.id }, { onConflict: 'customer_id' })
      .select('id')
      .single()

    // Create chat channels
    const CHANNELS = [
      { name: 'CEO Updates', department: 'leadership' },
      { name: 'Engineering', department: 'engineering' },
      { name: 'Product', department: 'product' },
      { name: 'Marketing', department: 'marketing' },
      { name: 'Sales', department: 'sales' },
      { name: 'Finance', department: 'finance' },
    ]
    for (const ch of CHANNELS) {
      const { data: existing } = await supabase
        .from('chat_channels')
        .select('id')
        .eq('customer_id', customer!.id)
        .eq('name', ch.name)
        .single()
      if (!existing) {
        await supabase.from('chat_channels').insert({
          customer_id: customer!.id,
          name: ch.name,
          department: ch.department,
        })
      }
    }

    // Seed 3 starter kanban cards
    if (kanbanBoard) {
      const starterCards = [
        { title: 'Define MVP feature scope', description: 'CEO Agent: Break down product requirements into a prioritised MVP feature list', priority: 'high', assigned_agent: 'Product Agent' },
        { title: 'Set up project architecture', description: 'Engineering Agent: Define tech stack, repo structure, and development workflow', priority: 'high', assigned_agent: 'Engineering Agent' },
        { title: 'Create go-to-market strategy', description: 'Marketing Agent: Identify target audience, messaging, and launch channels', priority: 'medium', assigned_agent: 'Marketing Agent' },
      ]
      for (const card of starterCards) {
        await supabase.from('kanban_cards').insert({
          board_id: kanbanBoard.id,
          ...card,
          column_name: 'backlog',
        })
      }

      // Post a welcome message to CEO Updates channel
      const { data: ceoChannel } = await supabase
        .from('chat_channels')
        .select('id')
        .eq('customer_id', customer!.id)
        .eq('name', 'CEO Updates')
        .single()

      if (ceoChannel) {
        await supabase.from('chat_messages').insert({
          channel_id: ceoChannel.id,
          sender_name: 'CEO Agent',
          sender_type: 'agent',
          content: `🚀 *Mission briefing received.*\n\nI've reviewed your vision and goals. Your AI team is now assembled and ready.\n\n**Today's priorities:**\n• Define the MVP scope with the Product team\n• Set up the engineering foundation\n• Begin market research\n\nI'll send daily briefings here. The team will post updates in their respective channels. Let's build something great.`,
        })
      }
    }

    router.push('/dashboard')
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

        <textarea
          key={current.id}
          value={values[current.field] ?? ''}
          onChange={e => handleChange(e.target.value)}
          placeholder={current.placeholder}
          rows={6}
          className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl text-white placeholder-[#4b5563] focus:border-[#6366f1] outline-none text-sm resize-none transition-colors"
        />

        {error && (
          <div className="mt-3 px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="px-4 py-2 text-sm text-[#6b7280] hover:text-white transition-colors disabled:opacity-0"
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            disabled={loading || !(values[current.field] ?? '').trim()}
            className="px-6 py-2.5 bg-[#6366f1] text-white rounded-xl hover:bg-[#818cf8] transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {loading ? 'Saving...' : isLast ? 'Launch my team →' : 'Next →'}
          </button>
        </div>
      </div>

      <p className="text-center text-[#4b5563] text-xs mt-6">
        Your answers help the CEO Agent understand your mission.
      </p>
    </div>
  )
}
