import Link from 'next/link'
import { Navbar } from '@/components/marketing/Navbar'
import { Footer } from '@/components/marketing/Footer'
import { SplineScene } from '@/components/ui/splite'
import { Spotlight } from '@/components/ui/spotlight'

const AGENTS = [
  {
    name: 'CEO Agent',
    role: 'Synthesises vision, orchestrates the team, writes strategy memos',
    color: '#a78bfa',
    bg: 'rgba(124,58,237,0.08)',
    border: 'rgba(167,139,250,0.25)',
    glyph: 'C',
  },
  {
    name: 'Product Agent',
    role: 'Writes PRDs, grooms the backlog, runs the kanban',
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.08)',
    border: 'rgba(56,189,248,0.25)',
    glyph: 'P',
  },
  {
    name: 'Engineer Agent',
    role: 'Writes and reviews code, opens PRs, resolves issues',
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.08)',
    border: 'rgba(74,222,128,0.25)',
    glyph: 'E',
  },
  {
    name: 'Marketing Agent',
    role: 'Content strategy, SEO, ad copy, launch campaigns',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.08)',
    border: 'rgba(251,146,60,0.25)',
    glyph: 'M',
  },
  {
    name: 'Sales Agent',
    role: 'Prospect outreach, follow-ups, CRM hygiene',
    color: '#f472b6',
    bg: 'rgba(244,114,182,0.08)',
    border: 'rgba(244,114,182,0.25)',
    glyph: 'S',
  },
  {
    name: 'Finance Agent',
    role: 'Budgets, P&L tracking, cash-flow forecasts',
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
    badge: null,
  },
  {
    name: 'Pro',
    price: { usd: 149, inr: 11999 },
    features: ['3 Agent teams', '15 agents', 'WhatsApp + Telegram', '500K tokens/mo (~250 agent runs)', 'CEO approval flows'],
    highlighted: true,
    badge: 'Most popular',
  },
  {
    name: 'Scale',
    price: { usd: 399, inr: 32999 },
    features: ['Unlimited teams', 'Unlimited agents', 'All channels', 'Unlimited tokens', 'Priority support'],
    highlighted: false,
    badge: null,
  },
]

const FEATURES = [
  {
    title: '24/7 autonomous ops',
    desc: 'Agents work continuously without supervision, executing tasks while you sleep.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: 'Approval workflows',
    desc: 'Critical decisions require your sign-off before agents proceed.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    title: 'Instant notifications',
    desc: 'Receive updates via Telegram or WhatsApp the moment agents take action.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: 'Claude Sonnet 4.6',
    desc: 'Every agent runs on Claude Sonnet 4.6 — one of the most capable reasoning models available.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
]

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen text-[#eef2f8]" style={{ background: '#05080f' }}>
      <Navbar />

      {/* ─── Hero ─── */}
      <section className="pt-32 pb-0 relative overflow-hidden min-h-[calc(100vh-64px)] flex items-center">
        {/* Ambient mesh */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(124,58,237,0.11) 0%, transparent 65%)',
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 50% 30% at 80% 80%, rgba(20,184,166,0.05) 0%, transparent 60%)',
        }} />
        {/* Subtle grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{
          backgroundImage: 'linear-gradient(rgba(167,139,250,1) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />
        <Spotlight className="-top-40 left-0 md:left-1/2 md:-top-20" fill="rgba(167,139,250,0.4)" />

        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-0">

          {/* Left — copy */}
          <div className="flex-1 flex flex-col items-start text-left max-w-xl lg:pr-12">
            {/* Status pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-10"
              style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(167,139,250,0.2)' }}>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inset-0 rounded-full bg-[#a78bfa] opacity-70" />
                <span className="relative block h-1.5 w-1.5 rounded-full bg-[#a78bfa]" />
              </span>
              <span className="text-[12px] font-semibold text-[#a78bfa] tracking-wide">Early access — limited spots</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-none"
              style={{ fontFamily: 'var(--font-bricolage, sans-serif)', letterSpacing: '-0.03em' }}>
              Your AI company,
              <br />
              <span className="gradient-text">assembled.</span>
            </h1>

            <p className="text-[17px] text-[#8b98b4] mb-11 leading-relaxed">
              Sangam brings together specialised AI agents as your CEO, Product, Engineering, Marketing, Sales, and Finance team — working 24/7 on your vision.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/login"
                className="px-8 py-3.5 rounded-xl font-semibold text-[15px] text-white transition-all duration-200 cursor-pointer"
                style={{ background: '#7c3aed', boxShadow: '0 0 28px rgba(124,58,237,0.45), 0 4px 12px rgba(0,0,0,0.3)' }}>
                Start building →
              </Link>
              <Link href="#features"
                className="px-8 py-3.5 rounded-xl font-medium text-[15px] text-[#8b98b4] hover:text-[#eef2f8] transition-all duration-200 cursor-pointer"
                style={{ border: '1px solid #1a2236' }}>
                See how it works
              </Link>
            </div>

            {/* Social proof bar */}
            <div className="mt-12 flex items-center gap-6 flex-wrap">
              {['Powered by Claude 4.6', 'No-code setup', 'Up and running today'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[12px] text-[#4a566e]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right — interactive robot */}
          <div className="flex-1 w-full lg:w-auto h-[480px] lg:h-[680px] relative">
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </div>

        </div>
      </section>

      {/* ─── Features strip ─── */}
      <section id="features" className="py-20 px-6 border-y border-[#1a2236]" style={{ background: '#0b1018' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ gap: '1px', background: '#1a2236' }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="p-8" style={{ background: '#0b1018' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 text-[#a78bfa]"
                style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(167,139,250,0.2)' }}>
                {f.icon}
              </div>
              <div className="font-bold text-[15px] text-[#eef2f8] mb-2"
                style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>
                {f.title}
              </div>
              <p className="text-[13px] text-[#4a566e] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Agents grid ─── */}
      <section id="agents" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[11px] font-bold text-[#7c3aed] uppercase tracking-[0.15em] mb-4">The team</div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#eef2f8] mb-4"
              style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>
              Meet your agents
            </h2>
            <p className="text-[15px] text-[#8b98b4] max-w-md mx-auto">
              Each agent is a specialist. Together, they form a full-stack company brain.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AGENTS.map(agent => (
              <div
                key={agent.name}
                className="agent-card p-6 rounded-2xl cursor-default"
                style={{
                  background: '#0b1018',
                  border: '1px solid #1a2236',
                  ['--card-border-hover' as string]: agent.border,
                }}
              >
                {/* Agent avatar */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 text-sm font-bold transition-transform duration-200"
                  style={{ background: agent.bg, border: `1px solid ${agent.border}`, color: agent.color }}>
                  {agent.glyph}
                </div>
                <div className="font-bold text-[15px] text-[#eef2f8] mb-2"
                  style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>
                  {agent.name}
                </div>
                <p className="text-[13px] text-[#4a566e] leading-relaxed">{agent.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-28 px-6 relative overflow-hidden" style={{ background: '#0b1018' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(124,58,237,0.06) 0%, transparent 70%)',
        }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="text-[11px] font-bold text-[#7c3aed] uppercase tracking-[0.15em] mb-4">Pricing</div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#eef2f8] mb-4"
              style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>
              Simple pricing
            </h2>
            <p className="text-[15px] text-[#8b98b4]">
              USD for global builders. INR for Indian founders. Fair pricing, always.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className="rounded-2xl p-7 flex flex-col gap-6 transition-all duration-200 relative"
                style={plan.highlighted ? {
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(20,184,166,0.06) 100%)',
                  border: '1px solid rgba(167,139,250,0.3)',
                  boxShadow: '0 0 40px rgba(124,58,237,0.12), 0 8px 32px rgba(0,0,0,0.3)',
                } : {
                  background: '#05080f',
                  border: '1px solid #253044',
                }}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold text-[#a78bfa] tracking-wide"
                      style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(167,139,250,0.3)' }}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="text-[13px] font-semibold text-[#8b98b4] mb-3">{plan.name}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold text-[#eef2f8]"
                      style={{ fontFamily: 'var(--font-bricolage, sans-serif)', letterSpacing: '-0.03em' }}>
                      ${plan.price.usd}
                    </span>
                    <span className="text-[13px] text-[#4a566e]">/mo</span>
                  </div>
                  <div className="text-[12px] text-[#2e3b52] mt-1">₹{plan.price.inr.toLocaleString('en-IN')}/mo</div>
                </div>

                <ul className="flex flex-col gap-3 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-[13px] text-[#8b98b4]">
                      <span className="text-[#7c3aed] flex-shrink-0"><CheckIcon /></span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href="/login"
                  className="text-center py-3 rounded-xl font-semibold text-[14px] transition-all duration-200 cursor-pointer block"
                  style={plan.highlighted ? {
                    background: '#7c3aed',
                    color: 'white',
                    boxShadow: '0 0 20px rgba(124,58,237,0.4)',
                  } : {
                    border: '1px solid #253044',
                    color: '#eef2f8',
                  }}>
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA banner ─── */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-3xl p-12 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(20,184,166,0.06) 100%)',
              border: '1px solid rgba(167,139,250,0.15)',
            }}>
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.1) 0%, transparent 70%)',
            }} />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#eef2f8] mb-4"
                style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>
                Ready to assemble<br />your team?
              </h2>
              <p className="text-[15px] text-[#8b98b4] mb-8 max-w-md mx-auto">
                Your agents are ready when you are. No infra to manage, no models to tune.
              </p>
              <Link href="/login"
                className="inline-block px-8 py-4 rounded-xl font-semibold text-[15px] text-white transition-all duration-200 cursor-pointer"
                style={{ background: '#7c3aed', boxShadow: '0 0 28px rgba(124,58,237,0.5), 0 4px 16px rgba(0,0,0,0.3)' }}>
                Start building →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
