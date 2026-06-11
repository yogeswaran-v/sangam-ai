import Link from 'next/link'
import { LandingNav } from '@/components/landing/LandingNav'
import { FaqAccordion, type FaqItem } from '@/components/landing/FaqAccordion'

/* ─────────────────────────── Data ─────────────────────────── */

const AGENTS = [
  {
    name: 'CEO Agent',
    role: 'Sets the weekly plan, writes strategy memos, and keeps the whole team pointed at what actually matters.',
    color: '#a78bfa',
    bg: 'rgba(124,58,237,0.08)',
    border: 'rgba(167,139,250,0.25)',
    glyph: 'C',
  },
  {
    name: 'Product Agent',
    role: 'Turns your rough ideas into PRDs, grooms the backlog, and runs the kanban so nothing slips.',
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.08)',
    border: 'rgba(56,189,248,0.25)',
    glyph: 'P',
  },
  {
    name: 'Engineering Agent',
    role: 'Writes and reviews code, opens PRs, and clears the bug list you keep postponing.',
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.08)',
    border: 'rgba(74,222,128,0.25)',
    glyph: 'E',
  },
  {
    name: 'Marketing Agent',
    role: 'Drafts the content, ad copy, and SEO pages you never get around to writing.',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.08)',
    border: 'rgba(251,146,60,0.25)',
    glyph: 'M',
  },
  {
    name: 'Sales Agent',
    role: 'Sends the outreach and follow-ups, and keeps the CRM clean — even while you sleep.',
    color: '#f472b6',
    bg: 'rgba(244,114,182,0.08)',
    border: 'rgba(244,114,182,0.25)',
    glyph: 'S',
  },
  {
    name: 'Finance Agent',
    role: 'Tracks P&L, forecasts runway, and flags spend before it becomes a problem.',
    color: '#14b8a6',
    bg: 'rgba(20,184,166,0.08)',
    border: 'rgba(20,184,166,0.25)',
    glyph: 'F',
  },
]

const PLANS = [
  {
    name: 'Starter',
    price: { usd: 49, inr: 3999 },
    features: ['1 Agent team', '5 agents', 'Telegram notifications', '100K tokens/mo (~50 agent runs)'],
    highlighted: false,
    badge: null as string | null,
  },
  {
    name: 'Pro',
    price: { usd: 149, inr: 11999 },
    features: ['3 Agent teams', '15 agents', 'WhatsApp + Telegram', '500K tokens/mo (~250 agent runs)', 'CEO approval flows'],
    highlighted: true,
    badge: 'Most popular' as string | null,
  },
  {
    name: 'Scale',
    price: { usd: 399, inr: 32999 },
    features: ['Unlimited teams', 'Unlimited agents', 'All channels', 'Unlimited tokens', 'Priority support'],
    highlighted: false,
    badge: null as string | null,
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Describe your company',
    desc: 'Tell Sangam what you’re building and what “done” looks like. Plain English, about ten minutes, no setup scripts.',
  },
  {
    n: '02',
    title: 'Your agents take the busywork',
    desc: 'The CEO agent turns your goal into a plan and hands tasks to Product, Engineering, Marketing, Sales, and Finance. They run 24/7.',
  },
  {
    n: '03',
    title: 'You approve the big calls',
    desc: 'Get a ping on Telegram or WhatsApp when something needs your sign-off. Everything else just gets done.',
  },
]

const HERO_FEED = [
  { color: '#a78bfa', name: 'CEO', task: 'Posted the Monday plan — 9 tasks assigned', time: 'now', working: true },
  { color: '#4ade80', name: 'Engineering', task: 'Opened PR #42: fix onboarding redirect', time: '2m', working: false },
  { color: '#fb923c', name: 'Marketing', task: 'Drafted 3 ad variants for launch week', time: '11m', working: false },
  { color: '#f472b6', name: 'Sales', task: 'Sent 12 follow-ups · 2 replies flagged', time: '26m', working: false },
  { color: '#14b8a6', name: 'Finance', task: 'Updated runway forecast: 14.2 months', time: '1h', working: false },
  { color: '#38bdf8', name: 'Product', task: 'Shipped PRD: referral program v1', time: '1h', working: false },
]

const PEEK_DESKS = [
  { id: 'ceo', label: 'CEO', color: '#a78bfa', x: '16%', y: '30%', delay: '0s' },
  { id: 'product', label: 'Product', color: '#38bdf8', x: '50%', y: '22%', delay: '0.4s' },
  { id: 'eng', label: 'Engineering', color: '#4ade80', x: '82%', y: '32%', delay: '0.8s' },
  { id: 'marketing', label: 'Marketing', color: '#fb923c', x: '20%', y: '72%', delay: '1.2s' },
  { id: 'finance', label: 'Finance', color: '#14b8a6', x: '52%', y: '80%', delay: '1.6s' },
  { id: 'sales', label: 'Sales', color: '#f472b6', x: '82%', y: '70%', delay: '2s' },
]

const PEEK_FEED = [
  { color: '#4ade80', text: 'Engineering Agent opened PR #42: fix onboarding redirect', time: '2m' },
  { color: '#fb923c', text: 'Marketing Agent drafted 3 ad variants for launch week', time: '11m' },
  { color: '#f472b6', text: 'Sales Agent sent 12 follow-ups — 2 replies flagged for you', time: '26m' },
  { color: '#14b8a6', text: 'Finance Agent updated the cash-flow forecast', time: '1h' },
]

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What do the agents actually do?',
    answer:
      'Real deliverables, not chat. The CEO agent plans the week, Product writes PRDs and runs your kanban, Engineering opens pull requests, Marketing drafts content and ad copy, Sales sends outreach and follow-ups, and Finance keeps your P&L and runway forecast current. You see everything they produce in your workspace.',
  },
  {
    question: 'Do I stay in control?',
    answer:
      'Yes. Anything significant — publishing, spending, sending to real customers — goes through an approval flow. You get a ping on Telegram or WhatsApp, review, and approve or reject in one tap. Agents never take irreversible actions without your sign-off.',
  },
  {
    question: 'How is this different from ChatGPT?',
    answer:
      'A chat window waits for you to prompt it. Sangam agents work proactively: they remember your company, coordinate with each other, and keep executing on schedule whether you’re online or not. It’s the difference between a smart intern you have to manage and a team that runs itself.',
  },
  {
    question: 'How long does setup take?',
    answer:
      'About ten minutes. You describe your company and goals in plain English — no code, no integrations required to start. Your agents introduce themselves and get to work the same day.',
  },
  {
    question: 'How does the free trial work?',
    answer:
      'Start free, no credit card required. Try your full agent team on real work, and pick a plan only when you’ve seen the output. Cancel anytime — your data stays yours.',
  },
]

/* ─────────────────────────── Small pieces ─────────────────────────── */

function CheckIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 text-[12px] font-bold uppercase tracking-[0.15em] text-[#a78bfa]">
      {children}
    </div>
  )
}

function CtaButton({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <Link
      href="/login"
      className={`inline-flex min-h-[52px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#7c3aed] px-8 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#8b5cf6] ${className}`}
      style={{ boxShadow: '0 0 28px rgba(124,58,237,0.45), 0 4px 12px rgba(0,0,0,0.3)' }}
    >
      {children}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </Link>
  )
}

/* Hero visual: a live "company feed" card. Pure HTML/CSS, no 3D. */
function HeroFeedCard() {
  return (
    <div
      className="w-full max-w-md rounded-2xl border border-[#1a2236]"
      style={{ background: '#0b1018', boxShadow: '0 24px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(124,58,237,0.08)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1a2236] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-60 motion-safe:animate-ping" />
            <span className="relative block h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[12px] font-semibold tracking-wide text-[#8b98b4]">
            Your company · live
          </span>
        </div>
        <span className="text-[12px] font-medium text-[#8b98b4]">Tuesday, 6:42 AM</span>
      </div>

      {/* Feed rows */}
      <ul className="flex flex-col px-2 py-2">
        {HERO_FEED.map((row, i) => (
          <li
            key={row.name}
            className="landing-fade-up flex items-center gap-3 rounded-xl px-2.5 py-2.5"
            style={{ animationDelay: `${0.15 + i * 0.12}s` }}
          >
            <span
              className="landing-dot-pulse h-2 w-2 flex-shrink-0 rounded-full"
              style={{ background: row.color, boxShadow: `0 0 8px ${row.color}66`, animationDelay: `${i * 0.3}s` }}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[12px] font-bold text-[#eef2f8]">{row.name}</span>
                <span className="flex-shrink-0 text-[12px] text-[#8b98b4]">{row.time}</span>
              </div>
              <p className="truncate text-[12px] leading-snug text-[#8b98b4]">{row.task}</p>
              {row.working && (
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[#161e2b]" aria-hidden="true">
                  <div className="landing-progress h-full rounded-full" style={{ background: row.color, width: '40%' }} />
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Footer: approvals */}
      <div className="flex items-center justify-between border-t border-[#1a2236] px-4 py-3">
        <span className="text-[12px] text-[#8b98b4]">2 decisions waiting for your sign-off</span>
        <span
          className="rounded-full px-2.5 py-1 text-[12px] font-bold text-[#a78bfa]"
          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(167,139,250,0.25)' }}
        >
          Review
        </span>
      </div>
    </div>
  )
}

/* ─────────────────────────── Page ─────────────────────────── */

export default function HomePage() {
  return (
    <div className="min-h-screen text-[#eef2f8]" style={{ background: '#05080f' }}>
      <LandingNav />

      {/* ─── 1. Hero ─── */}
      <section className="relative overflow-hidden px-5 pb-16 pt-28 sm:pt-36 lg:pb-24">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(124,58,237,0.13) 0%, transparent 65%)' }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(167,139,250,1) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,1) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* Copy */}
          <div className="flex max-w-xl flex-1 flex-col items-center text-center lg:items-start lg:text-left">
            <div
              className="landing-fade-up mb-7 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
              style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(167,139,250,0.2)' }}
            >
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="absolute inset-0 rounded-full bg-[#a78bfa] opacity-70 motion-safe:animate-ping" />
                <span className="relative block h-1.5 w-1.5 rounded-full bg-[#a78bfa]" />
              </span>
              <span className="text-[12px] font-semibold tracking-wide text-[#a78bfa]">
                Early access — now onboarding solo founders
              </span>
            </div>

            <h1
              className="landing-fade-up mb-5 text-[40px] font-extrabold leading-[1.05] tracking-tight sm:text-6xl"
              style={{ fontFamily: 'var(--font-bricolage, sans-serif)', letterSpacing: '-0.03em', animationDelay: '0.08s' }}
            >
              Your AI team runs the company{' '}
              <span className="gradient-text">while you build</span>
            </h1>

            <p
              className="landing-fade-up mb-8 max-w-md text-[16px] leading-relaxed text-[#8b98b4] sm:text-[17px]"
              style={{ animationDelay: '0.16s' }}
            >
              Six AI agents — CEO, Product, Engineering, Marketing, Sales, and Finance — handle
              the memos, ad copy, follow-ups, and forecasts. Stop spending founder hours on $20/hr work.
            </p>

            <div className="landing-fade-up flex w-full flex-col items-center lg:items-start" style={{ animationDelay: '0.24s' }}>
              <CtaButton className="w-full sm:w-auto">Start free trial</CtaButton>
              <p className="mt-4 text-[14px] text-[#8b98b4]">
                No credit card required · Set up in ~10 minutes
              </p>
            </div>
          </div>

          {/* Visual */}
          <div className="landing-fade-up flex w-full flex-1 justify-center lg:justify-end" style={{ animationDelay: '0.3s' }}>
            <HeroFeedCard />
          </div>
        </div>
      </section>

      {/* ─── 2. Social proof strip ─── */}
      <section className="border-y border-[#1a2236] px-5 py-10" style={{ background: '#0b1018' }}>
        <div className="mx-auto max-w-6xl">
          <p className="mb-6 text-center text-[14px] font-semibold text-[#8b98b4]">
            Built for indie hackers who’d rather ship than manage — the first early-access cohort is open
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 lg:grid-cols-4">
            {[
              '6 specialist agents on day one',
              'Runs 24/7, even while you sleep',
              'You approve every big decision',
              'Powered by Claude Sonnet 4.6',
            ].map(item => (
              <div key={item} className="flex items-start justify-center gap-2 text-center lg:justify-start lg:text-left">
                <span className="mt-0.5 flex-shrink-0 text-[#a78bfa]">
                  <CheckIcon />
                </span>
                <span className="text-[14px] leading-snug text-[#8b98b4]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. How it works ─── */}
      <section id="how-it-works" className="scroll-mt-24 px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center sm:mb-16">
            <SectionLabel>How it works</SectionLabel>
            <h2
              className="mb-4 text-3xl font-extrabold text-[#eef2f8] sm:text-5xl"
              style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}
            >
              From idea to running company in three steps
            </h2>
            <p className="mx-auto max-w-md text-[15px] text-[#8b98b4]">
              No code, no infra, no prompt engineering. You bring the vision — Sangam brings the team.
            </p>
          </div>

          <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {STEPS.map(step => (
              <li
                key={step.n}
                className="rounded-2xl border border-[#1a2236] p-6 sm:p-7"
                style={{ background: '#0b1018' }}
              >
                <div
                  className="mb-5 inline-flex h-10 items-center justify-center rounded-xl px-3 text-[14px] font-bold text-[#a78bfa]"
                  style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(167,139,250,0.2)', fontFamily: 'var(--font-bricolage, sans-serif)' }}
                  aria-hidden="true"
                >
                  {step.n}
                </div>
                <h3
                  className="mb-2 text-[17px] font-bold text-[#eef2f8]"
                  style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}
                >
                  {step.title}
                </h3>
                <p className="text-[14px] leading-relaxed text-[#8b98b4]">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── 4. Agents showcase ─── */}
      <section id="agents" className="scroll-mt-24 border-t border-[#1a2236] px-5 py-20 sm:py-28" style={{ background: '#0b1018' }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center sm:mb-16">
            <SectionLabel>The team</SectionLabel>
            <h2
              className="mb-4 text-3xl font-extrabold text-[#eef2f8] sm:text-5xl"
              style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}
            >
              Six hires you don’t have to make
            </h2>
            <p className="mx-auto max-w-md text-[15px] text-[#8b98b4]">
              Each agent is a specialist with a real job description. Together they’re a full-stack company brain.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AGENTS.map(agent => (
              <div
                key={agent.name}
                className="agent-card rounded-2xl p-6"
                style={{
                  background: '#05080f',
                  border: '1px solid #1a2236',
                  ['--card-border-hover' as string]: agent.border,
                }}
              >
                <div
                  className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold"
                  style={{ background: agent.bg, border: `1px solid ${agent.border}`, color: agent.color }}
                  aria-hidden="true"
                >
                  {agent.glyph}
                </div>
                <h3
                  className="mb-2 text-[15px] font-bold text-[#eef2f8]"
                  style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}
                >
                  {agent.name}
                </h3>
                <p className="text-[14px] leading-relaxed text-[#8b98b4]">{agent.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. Product peek: pixel HQ ─── */}
      <section id="product" className="scroll-mt-24 px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center sm:mb-16">
            <SectionLabel>Inside Sangam</SectionLabel>
            <h2
              className="mb-4 text-3xl font-extrabold text-[#eef2f8] sm:text-5xl"
              style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}
            >
              Watch your company run
            </h2>
            <p className="mx-auto max-w-md text-[15px] text-[#8b98b4]">
              Sangam’s live HQ shows every agent at its desk — who’s working, what’s shipping, in real time.
            </p>
          </div>

          <div
            className="overflow-hidden rounded-2xl border border-[#1a2236]"
            style={{ background: '#0b1018', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-[#1a2236] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#253044]" aria-hidden="true" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#253044]" aria-hidden="true" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#253044]" aria-hidden="true" />
              <span className="ml-2 text-[12px] font-semibold text-[#8b98b4]">Sangam HQ — live view</span>
            </div>

            {/* Pixel office */}
            <div
              className="relative h-[240px] sm:h-[300px]"
              style={{
                background:
                  'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.07) 0%, transparent 70%), linear-gradient(rgba(167,139,250,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.05) 1px, transparent 1px)',
                backgroundSize: '100% 100%, 28px 28px, 28px 28px',
              }}
            >
              {PEEK_DESKS.map(desk => (
                <div
                  key={desk.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: desk.x, top: desk.y }}
                >
                  <div className="flex flex-col items-center gap-1">
                    {/* Agent sprite */}
                    <div className="landing-bob" style={{ animationDelay: desk.delay }}>
                      <div
                        className="relative h-5 w-5 rounded-[5px] sm:h-6 sm:w-6"
                        style={{ background: desk.color, boxShadow: `0 0 14px ${desk.color}55` }}
                        aria-hidden="true"
                      >
                        <span className="absolute left-[22%] top-[30%] h-[3px] w-[3px] rounded-full bg-[#05080f]" />
                        <span className="absolute right-[22%] top-[30%] h-[3px] w-[3px] rounded-full bg-[#05080f]" />
                      </div>
                    </div>
                    {/* Desk */}
                    <div
                      className="h-2 w-10 rounded-[3px] border border-[#253044] sm:w-12"
                      style={{ background: '#161e2b' }}
                      aria-hidden="true"
                    />
                    {/* Label */}
                    <span className="text-[12px] font-semibold tracking-wide text-[#8b98b4]">{desk.label}</span>
                    {/* Status light */}
                    <span
                      className="landing-dot-pulse h-1 w-1 rounded-full"
                      style={{ background: desk.color, animationDelay: desk.delay }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Activity feed */}
            <div className="border-t border-[#1a2236]">
              <ul className="flex flex-col divide-y divide-[#1a2236]">
                {PEEK_FEED.map(item => (
                  <li key={item.text} className="flex items-center gap-3 px-4 py-3">
                    <span
                      className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                      style={{ background: item.color }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate text-[12px] text-[#8b98b4]">{item.text}</span>
                    <span className="flex-shrink-0 text-[12px] text-[#8b98b4]">{item.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-4 text-center text-[12px] text-[#8b98b4]">
            Illustration of a running Sangam workspace — your agents, your tasks, your company.
          </p>
        </div>
      </section>

      {/* ─── 6. Pricing ─── */}
      <section id="pricing" className="relative scroll-mt-24 overflow-hidden border-t border-[#1a2236] px-5 py-20 sm:py-28" style={{ background: '#0b1018' }}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(124,58,237,0.06) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="mb-12 text-center sm:mb-16">
            <SectionLabel>Pricing</SectionLabel>
            <h2
              className="mb-4 text-3xl font-extrabold text-[#eef2f8] sm:text-5xl"
              style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}
            >
              Less than one freelancer invoice
            </h2>
            <p className="text-[15px] text-[#8b98b4]">
              USD for global builders, INR for Indian founders. Start free — pick a plan when you’ve seen the output.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className="relative flex flex-col gap-6 rounded-2xl p-7"
                style={
                  plan.highlighted
                    ? {
                        background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(20,184,166,0.06) 100%)',
                        border: '1px solid rgba(167,139,250,0.3)',
                        boxShadow: '0 0 40px rgba(124,58,237,0.12), 0 8px 32px rgba(0,0,0,0.3)',
                      }
                    : {
                        background: '#05080f',
                        border: '1px solid #253044',
                      }
                }
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span
                      className="rounded-full px-3 py-1 text-[12px] font-bold tracking-wide text-[#a78bfa]"
                      style={{ background: 'rgba(20,12,40,1)', border: '1px solid rgba(167,139,250,0.3)' }}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="mb-3 text-[14px] font-semibold text-[#8b98b4]">{plan.name}</div>
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-5xl font-extrabold text-[#eef2f8]"
                      style={{ fontFamily: 'var(--font-bricolage, sans-serif)', letterSpacing: '-0.03em' }}
                    >
                      ${plan.price.usd}
                    </span>
                    <span className="text-[14px] text-[#8b98b4]">/mo</span>
                  </div>
                  <div className="mt-1 text-[12px] text-[#8b98b4]">
                    ₹{plan.price.inr.toLocaleString('en-IN')}/mo
                  </div>
                </div>

                <ul className="flex flex-1 flex-col gap-3">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-[14px] leading-snug text-[#8b98b4]">
                      <span className="mt-0.5 flex-shrink-0 text-[#a78bfa]">
                        <CheckIcon />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login"
                  className="flex min-h-[48px] cursor-pointer items-center justify-center rounded-xl text-[14px] font-semibold transition-colors duration-200"
                  style={
                    plan.highlighted
                      ? { background: '#7c3aed', color: 'white', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }
                      : { border: '1px solid #253044', color: '#eef2f8' }
                  }
                >
                  Start free trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 7. FAQ ─── */}
      <section id="faq" className="scroll-mt-24 px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl">
          <div className="mb-12 text-center">
            <SectionLabel>FAQ</SectionLabel>
            <h2
              className="mb-4 text-3xl font-extrabold text-[#eef2f8] sm:text-5xl"
              style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}
            >
              Fair questions
            </h2>
            <p className="text-[15px] text-[#8b98b4]">
              The things every founder asks before handing work to an AI team.
            </p>
          </div>
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </section>

      {/* ─── 8. Final CTA ─── */}
      <section className="px-5 pb-20 sm:pb-28">
        <div className="mx-auto max-w-3xl">
          <div
            className="relative overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12 sm:py-16"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(20,184,166,0.06) 100%)',
              border: '1px solid rgba(167,139,250,0.15)',
            }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.1) 0%, transparent 70%)' }}
              aria-hidden="true"
            />
            <div className="relative z-10">
              <h2
                className="mb-4 text-3xl font-extrabold text-[#eef2f8] sm:text-5xl"
                style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}
              >
                Get your founder hours back
              </h2>
              <p className="mx-auto mb-8 max-w-md text-[15px] leading-relaxed text-[#8b98b4]">
                Tonight your agents can plan the week, draft the launch copy, and chase the follow-ups —
                while you do the work only you can do.
              </p>
              <CtaButton className="w-full sm:w-auto">Start free trial</CtaButton>
              <p className="mt-4 text-[14px] text-[#8b98b4]">No credit card required</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#1a2236] px-5 pb-8 pt-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="max-w-[260px]">
            <Link href="/" className="mb-4 flex min-h-[44px] cursor-pointer items-center gap-2.5">
              <span className="relative h-6 w-6" aria-hidden="true">
                <span className="absolute inset-0 rounded-md border border-[#7c3aed]/30 bg-[#7c3aed]/20" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-[#a78bfa]" style={{ boxShadow: '0 0 6px rgba(167,139,250,0.7)' }} />
                </span>
              </span>
              <span
                className="text-[15px] font-bold text-[#eef2f8]"
                style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}
              >
                Sangam<span className="text-[#a78bfa]">.ai</span>
              </span>
            </Link>
            <p className="text-[14px] leading-relaxed text-[#8b98b4]">
              Your AI team runs the company while you build.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-14 text-[14px]">
            <div className="flex flex-col">
              <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8b98b4]">
                Product
              </div>
              {[
                ['How it works', '#how-it-works'],
                ['Agents', '#agents'],
                ['Pricing', '#pricing'],
                ['FAQ', '#faq'],
                ['Sign in', '/login'],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="flex min-h-[44px] cursor-pointer items-center text-[#8b98b4] transition-colors duration-200 hover:text-[#eef2f8]"
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col">
              <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8b98b4]">
                Legal
              </div>
              {[
                ['Terms', '/terms'],
                ['Privacy', '/privacy'],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="flex min-h-[44px] cursor-pointer items-center text-[#8b98b4] transition-colors duration-200 hover:text-[#eef2f8]"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-3 border-t border-[#1a2236] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-[#8b98b4]">© 2026 Sangam.ai — built with AI, for builders.</p>
          <div className="flex items-center gap-2 text-[12px] text-[#8b98b4]">
            <span className="relative h-1.5 w-1.5" aria-hidden="true">
              <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-60 motion-safe:animate-ping" />
              <span className="relative block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            All systems operational
          </div>
        </div>
      </footer>
    </div>
  )
}
