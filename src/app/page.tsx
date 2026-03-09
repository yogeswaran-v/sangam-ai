import Link from 'next/link'
import { Navbar } from '@/components/marketing/Navbar'
import { Footer } from '@/components/marketing/Footer'

const AGENTS = [
  { name: 'CEO Agent', role: 'Synthesises vision, delegates to team', color: '#6366f1', glyph: 'C' },
  { name: 'Product Agent', role: 'Writes PRDs, manages kanban', color: '#22d3ee', glyph: 'P' },
  { name: 'Engineer Agent', role: 'Writes & reviews code', color: '#10b981', glyph: 'E' },
  { name: 'Marketing Agent', role: 'Content, SEO, campaigns', color: '#f59e0b', glyph: 'M' },
  { name: 'Sales Agent', role: 'Outreach, follow-ups, CRM', color: '#818cf8', glyph: 'S' },
  { name: 'Finance Agent', role: 'Budgets, P&L, forecasts', color: '#34d399', glyph: 'F' },
]

const PLANS = [
  {
    name: 'Starter',
    price: { usd: 49, inr: 3999 },
    features: ['1 Agent team', '5 agents', 'Telegram notifications', '100K tokens/mo'],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: { usd: 149, inr: 11999 },
    features: ['3 Agent teams', '15 agents', 'WhatsApp + Telegram', '500K tokens/mo', 'CEO approval flows'],
    highlighted: true,
  },
  {
    name: 'Scale',
    price: { usd: 399, inr: 32999 },
    features: ['Unlimited teams', 'Unlimited agents', 'All channels', 'Unlimited tokens', 'Priority support'],
    highlighted: false,
  },
]

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-44 pb-24 px-6 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(99,102,241,0.12),transparent)] pointer-events-none" />
        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />

        <div className="max-w-4xl mx-auto relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#6366f1]/30 bg-[#6366f1]/10 text-[#818cf8] text-xs mb-8 font-medium">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6366f1] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#6366f1]" />
            </span>
            Now in early access — limited spots
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.05]"
            style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            Your AI company,
            <br />
            <span className="text-[#6366f1] [text-shadow:0_0_40px_rgba(99,102,241,0.5)]">assembled</span>
          </h1>

          <p className="text-[#6b7280] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Sangam brings together specialised AI agents as your CEO, Product, Engineering, Marketing, Sales, and Finance team — working 24/7 on your vision.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-[#6366f1] text-white rounded-xl hover:bg-[#818cf8] transition-all duration-200 font-semibold text-base cursor-pointer shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:shadow-[0_0_32px_rgba(99,102,241,0.6)]"
            >
              Start building →
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 border border-[#1e1e2e] text-[#6b7280] rounded-xl hover:border-[#6366f1]/40 hover:text-white transition-all duration-200 text-base cursor-pointer"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* Agents grid */}
      <section id="agents" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-3xl font-bold text-center mb-4"
            style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            Meet your team
          </h2>
          <p className="text-[#6b7280] text-center mb-16 max-w-xl mx-auto text-sm leading-relaxed">
            Each agent is a specialist. Together, they form a full-stack company brain.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="features">
            {AGENTS.map(agent => (
              <div
                key={agent.name}
                className="p-6 bg-[#0d0d15] border border-[#1e1e2e] rounded-2xl hover:border-opacity-60 transition-all duration-200 cursor-default group"
                style={{ ['--agent-color' as string]: agent.color }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-sm font-bold transition-all duration-200 group-hover:scale-110"
                  style={{
                    backgroundColor: `${agent.color}18`,
                    border: `1px solid ${agent.color}40`,
                    color: agent.color,
                    boxShadow: `0 0 0 rgba(${agent.color}, 0)`,
                  }}
                >
                  {agent.glyph}
                </div>
                <div
                  className="font-semibold text-white mb-1.5"
                  style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
                >
                  {agent.name}
                </div>
                <div className="text-[#4b5563] text-sm leading-relaxed">{agent.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-[#0d0d15]">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl font-bold text-center mb-4"
            style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            Simple pricing
          </h2>
          <p className="text-[#6b7280] text-center mb-16 max-w-xl mx-auto text-sm leading-relaxed">
            USD for global builders. INR for Indian founders. Same product, fair pricing.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={`p-8 rounded-2xl border flex flex-col gap-6 transition-all duration-200 ${
                  plan.highlighted
                    ? 'bg-[#6366f1]/8 border-[#6366f1]/40 shadow-[0_0_40px_rgba(99,102,241,0.12)]'
                    : 'bg-[#0a0a0f] border-[#1e1e2e] hover:border-[#6366f1]/20'
                }`}
              >
                {plan.highlighted && (
                  <div className="text-[10px] font-bold text-[#6366f1] tracking-[0.15em] uppercase">Most popular</div>
                )}
                <div>
                  <div
                    className="text-xl font-bold text-white"
                    style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
                  >
                    {plan.name}
                  </div>
                  <div
                    className="text-3xl font-bold text-white mt-2"
                    style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
                  >
                    ${plan.price.usd}<span className="text-[#4b5563] text-base font-normal">/mo</span>
                  </div>
                  <div className="text-[#4b5563] text-sm mt-1">₹{plan.price.inr.toLocaleString('en-IN')}/mo</div>
                </div>
                <ul className="flex flex-col gap-3 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[#6b7280]">
                      <span className="text-[#6366f1] flex-shrink-0"><CheckIcon /></span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`text-center py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                    plan.highlighted
                      ? 'bg-[#6366f1] text-white hover:bg-[#818cf8] shadow-[0_0_16px_rgba(99,102,241,0.3)]'
                      : 'border border-[#1e1e2e] text-[#6b7280] hover:border-[#6366f1]/40 hover:text-white'
                  }`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
