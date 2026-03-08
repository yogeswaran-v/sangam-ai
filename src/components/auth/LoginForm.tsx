'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'initial' | 'otp'>('initial')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function signInWithGoogle() {
    setError(null)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function sendOtp() {
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ phone })
    if (error) {
      setError(error.message)
    } else {
      setStep('otp')
    }
    setLoading(false)
  }

  async function verifyOtp() {
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      {error && (
        <div className="px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={signInWithGoogle}
        className="flex items-center justify-center gap-3 px-4 py-3 bg-[#12121a] border border-[#1e1e2e] rounded-lg text-white hover:border-[#6366f1] transition-colors text-sm"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
          <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-3 text-[#6b7280] text-xs">
        <div className="flex-1 h-px bg-[#1e1e2e]" />
        <span>or</span>
        <div className="flex-1 h-px bg-[#1e1e2e]" />
      </div>

      {step === 'initial' ? (
        <div className="flex flex-col gap-3">
          <input
            type="tel"
            placeholder="+91 9999999999"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="px-4 py-3 bg-[#12121a] border border-[#1e1e2e] rounded-lg text-white placeholder-[#6b7280] focus:border-[#6366f1] outline-none text-sm"
          />
          <button
            onClick={sendOtp}
            disabled={loading || !phone.trim()}
            className="px-4 py-3 bg-[#6366f1] text-white rounded-lg hover:bg-[#818cf8] transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-[#6b7280] text-xs">OTP sent to {phone}</p>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            maxLength={6}
            className="px-4 py-3 bg-[#12121a] border border-[#1e1e2e] rounded-lg text-white placeholder-[#6b7280] focus:border-[#6366f1] outline-none text-sm tracking-widest"
          />
          <button
            onClick={verifyOtp}
            disabled={loading || otp.length !== 6}
            className="px-4 py-3 bg-[#6366f1] text-white rounded-lg hover:bg-[#818cf8] transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button
            onClick={() => { setStep('initial'); setOtp(''); setError(null) }}
            className="text-[#6b7280] text-xs hover:text-white transition-colors"
          >
            ← Change number
          </button>
        </div>
      )}
    </div>
  )
}
