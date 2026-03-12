import Link from 'next/link'
import { Navbar } from '@/components/marketing/Navbar'
import { Footer } from '@/components/marketing/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen text-[#eef2f8]" style={{ background: '#05080f' }}>
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 pt-40 pb-28">
        <div className="mb-12">
          <div className="text-[11px] font-bold text-[#7c3aed] uppercase tracking-[0.15em] mb-4">Legal</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#eef2f8] mb-4"
            style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>
            Privacy Policy
          </h1>
          <p className="text-[13px] text-[#4a566e]">Last updated: March 2026</p>
        </div>

        <div className="flex flex-col gap-10 text-[15px] text-[#8b98b4] leading-relaxed">
          <section>
            <h2 className="text-[17px] font-bold text-[#eef2f8] mb-3"
              style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>
              What we collect
            </h2>
            <p>We collect your email address and any information you provide during onboarding. We log agent activity — tasks created, actions taken, notifications sent — to deliver the service and help you audit your agents&apos; work.</p>
          </section>

          <section>
            <h2 className="text-[17px] font-bold text-[#eef2f8] mb-3"
              style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>
              How we use it
            </h2>
            <p>Your data is used solely to operate Sangam.ai. We do not sell it, share it with third parties for advertising, or use it to train AI models. Agent prompts and outputs are processed by Anthropic&apos;s Claude API under their data processing terms.</p>
          </section>

          <section>
            <h2 className="text-[17px] font-bold text-[#eef2f8] mb-3"
              style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>
              Third-party services
            </h2>
            <p>We use Supabase for data storage, Anthropic for AI inference, Stripe and Razorpay for payments, and Telegram/WhatsApp for notifications. Each operates under their own privacy policies.</p>
          </section>

          <section>
            <h2 className="text-[17px] font-bold text-[#eef2f8] mb-3"
              style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}>
              Data retention
            </h2>
            <p>We retain your data for as long as your account is active. You can request deletion at any time by emailing us. We will purge your data within 30 days of receiving your request.</p>
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
