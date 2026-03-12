import Link from 'next/link'
import { Navbar } from '@/components/marketing/Navbar'
import { Footer } from '@/components/marketing/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen text-[#eef2f8]" style={{ background: '#05080f' }}>
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 pt-40 pb-28">
        <div className="mb-12">
          <div className="text-[11px] font-bold text-[#7c3aed] uppercase tracking-[0.15em] mb-4">Legal</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#eef2f8] mb-4"
            style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>
            Terms of Service
          </h1>
          <p className="text-[13px] text-[#4a566e]">Last updated: March 2026</p>
        </div>

        <div className="flex flex-col gap-10 text-[15px] text-[#8b98b4] leading-relaxed">
          <section>
            <h2 className="text-[17px] font-bold text-[#eef2f8] mb-3"
              style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>
              Acceptance
            </h2>
            <p>By creating an account or using Sangam.ai, you agree to these terms. If you do not agree, do not use the service.</p>
          </section>

          <section>
            <h2 className="text-[17px] font-bold text-[#eef2f8] mb-3"
              style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>
              The service
            </h2>
            <p>Sangam.ai provides an AI agent orchestration platform. Agents operate autonomously within the limits you configure. You are responsible for reviewing agent outputs, approving high-stakes actions, and ensuring agents are used lawfully.</p>
          </section>

          <section>
            <h2 className="text-[17px] font-bold text-[#eef2f8] mb-3"
              style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>
              Acceptable use
            </h2>
            <p>You may not use Sangam.ai to generate spam, conduct fraud, violate third-party terms of service, or cause harm. We reserve the right to suspend accounts that violate these terms without notice.</p>
          </section>

          <section>
            <h2 className="text-[17px] font-bold text-[#eef2f8] mb-3"
              style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>
              Billing
            </h2>
            <p>Subscriptions are billed monthly. You can cancel at any time; cancellation takes effect at the end of the current billing period. We do not offer refunds for partial months.</p>
          </section>

          <section>
            <h2 className="text-[17px] font-bold text-[#eef2f8] mb-3"
              style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>
              Limitation of liability
            </h2>
            <p>Sangam.ai is provided &quot;as is&quot;. We are not liable for decisions made by AI agents, losses arising from agent actions, or service interruptions. Always maintain human oversight for consequential decisions.</p>
          </section>

          <section>
            <h2 className="text-[17px] font-bold text-[#eef2f8] mb-3"
              style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>
              Changes
            </h2>
            <p>We may update these terms. We will notify you by email if changes are material. Continued use after notice constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-[17px] font-bold text-[#eef2f8] mb-3"
              style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>
              Contact
            </h2>
            <p>Questions? Reach us at <a href="mailto:hello@sangam.ai" className="text-[#a78bfa] hover:underline">hello@sangam.ai</a>.</p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-[#1a2236]">
          <Link href="/" className="text-[13px] text-[#4a566e] hover:text-[#8b98b4] transition-colors">← Back to home</Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
