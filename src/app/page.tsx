import Link from 'next/link'
import { Navbar } from '@/components/marketing/Navbar'
import { Footer } from '@/components/marketing/Footer'

const AGENTS = [
  { name: 'CEO Agent', role: 'Synthesises vision, delegates to team', icon: '👑' },
  { name: 'Product Agent', role: 'Writes PRDs, manages kanban', icon: '📋' },
  { name: 'Engineer Agent', role: 'Writes & reviews code', icon: '⚙️' },
  { name: 'Marketing Agent', role: 'Content, SEO, campaigns', icon: '📣' },
  { name: 'Sales Agent', role: 'Outreach, follow-ups, CRM', icon: '💼' },
  { name: 'Finance Agent', role: 'Budgets, P&L, forecasts', icon: '📊' },
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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#6366f1]/30 bg-[#6366f1]/10 text-[#818cf8] text-xs mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1] animate-pulse" />
            Now in early access — limited spots
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Your AI company,<br />
            <span className="text-[#6366f1]">assembled</span>
          </h1>
          <p className="text-[#9ca3af] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Sangam brings together specialised AI agents as your CEO, Product, Engineering, Marketing, Sales, and Finance team — working 24/7 on your vision.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="px-8 py-4 bg-[#6366f1] text-white rounded-xl hover:bg-[#818cf8] transition-colors font-semibold text-lg">
              Start building →
            </Link>
            <Link href="#features" className="px-8 py-4 border border-[#1e1e2e] text-[#9ca3af] rounded-xl hover:border-[#6366f1] hover:text-white transition-colors text-lg">
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* Agents grid */}
      <section id="agents" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Meet your team</h2>
          <p className="text-[#6b7280] text-center mb-16 max-w-xl mx-auto">
            Each agent is a specialist. Together, they form a full-stack company brain.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AGENTS.map(agent => (
              <div key={agent.name} className="p-6 bg-[#12121a] border border-[#1e1e2e] rounded-2xl hover:border-[#6366f1]/50 transition-colors">
                <div className="text-3xl mb-4">{agent.icon}</div>
                <div className="font-semibold text-white mb-1">{agent.name}</div>
                <div className="text-[#6b7280] text-sm">{agent.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-[#0d0d15]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
          <p className="text-[#6b7280] text-center mb-16 max-w-xl mx-auto">
            USD for global builders. INR for Indian founders. Same product, fair pricing.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={`p-8 rounded-2xl border flex flex-col gap-6 ${
                  plan.highlighted
                    ? 'bg-[#6366f1]/10 border-[#6366f1]/50'
                    : 'bg-[#12121a] border-[#1e1e2e]'
                }`}
              >
                {plan.highlighted && (
                  <div className="text-xs font-medium text-[#6366f1] tracking-widest uppercase">Most popular</div>
                )}
                <div>
                  <div className="text-xl font-bold text-white">{plan.name}</div>
                  <div className="text-3xl font-bold text-white mt-2">
                    ${plan.price.usd}<span className="text-[#6b7280] text-base font-normal">/mo</span>
                  </div>
                  <div className="text-[#6b7280] text-sm mt-1">₹{plan.price.inr.toLocaleString('en-IN')}/mo</div>
                </div>
                <ul className="flex flex-col gap-3 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[#9ca3af]">
                      <span className="text-[#6366f1]">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`text-center py-3 rounded-xl font-medium text-sm transition-colors ${
                    plan.highlighted
                      ? 'bg-[#6366f1] text-white hover:bg-[#818cf8]'
                      : 'border border-[#1e1e2e] text-[#9ca3af] hover:border-[#6366f1] hover:text-white'
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
