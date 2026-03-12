'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// Detect in-app browsers (LinkedIn, Facebook, Instagram, etc.)
// Google blocks OAuth in these — we intercept before the user hits the 403
function detectInAppBrowser(): { isInApp: boolean; isAndroid: boolean; name: string } {
  if (typeof navigator === 'undefined') return { isInApp: false, isAndroid: false, name: '' }
  const ua = navigator.userAgent || ''
  const isAndroid = /Android/i.test(ua)
  if (/LinkedIn/i.test(ua))          return { isInApp: true, isAndroid, name: 'LinkedIn' }
  if (/FBAN|FBAV|FB_IAB/i.test(ua))  return { isInApp: true, isAndroid, name: 'Facebook' }
  if (/Instagram/i.test(ua))         return { isInApp: true, isAndroid, name: 'Instagram' }
  if (/Twitter/i.test(ua))           return { isInApp: true, isAndroid, name: 'X (Twitter)' }
  if (/Line\//i.test(ua))            return { isInApp: true, isAndroid, name: 'Line' }
  if (/MicroMessenger/i.test(ua))    return { isInApp: true, isAndroid, name: 'WeChat' }
  if (/GSA\//i.test(ua))             return { isInApp: true, isAndroid, name: 'Google App' }
  return { isInApp: false, isAndroid, name: '' }
}

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
)

export function LoginForm() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'initial' | 'otp'>('initial')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [inApp, setInApp] = useState<{ isInApp: boolean; isAndroid: boolean; name: string }>({ isInApp: false, isAndroid: false, name: '' })
  const supabase = createClient()

  useEffect(() => {
    setInApp(detectInAppBrowser())
  }, [])

  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://sangam-ai-pi.vercel.app/login'

  function openInChrome() {
    // Android: intent URI forces Chrome to open the URL
    window.location.href = `intent://${pageUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(pageUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
    <div className="w-full max-w-sm">
      <div className="rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: '#0b1018', border: '1px solid #1a2236', boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }}>

        {error && (
          <div className="px-4 py-3 rounded-xl text-[13px] text-[#f87171]"
            style={{ background: 'rgba(248,65,65,0.08)', border: '1px solid rgba(248,65,65,0.2)' }}>
            {error}
          </div>
        )}

        {/* In-app browser gate */}
        {inApp.isInApp ? (
          <div className="flex flex-col gap-3">
            <div className="px-4 py-3 rounded-xl text-[13px]"
              style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)' }}>
              <p className="font-semibold text-[#fb923c] mb-1">Google sign-in blocked</p>
              <p className="text-[#8b98b4] leading-relaxed">
                {inApp.name}&apos;s browser doesn&apos;t allow Google sign-in.
                Open this page in Chrome or Safari.
              </p>
            </div>

            {inApp.isAndroid ? (
              <button
                onClick={openInChrome}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold text-white cursor-pointer"
                style={{ background: '#7c3aed', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }}
              >
                Open in Chrome
              </button>
            ) : (
              <p className="text-[12px] text-[#4a566e] text-center leading-relaxed">
                Tap <span className="text-[#8b98b4]">&#8943;</span> or the share icon → <span className="text-[#8b98b4]">Open in Browser</span>
              </p>
            )}

            <button
              onClick={copyUrl}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer transition-colors"
              style={{ background: '#101620', border: '1px solid #1a2236', color: copied ? '#4ade80' : '#8b98b4' }}
            >
              {copied ? '✓ Copied' : 'Copy link'}
            </button>
          </div>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="flex items-center justify-center gap-2.5 py-3 rounded-xl text-[14px] font-medium text-[#eef2f8] transition-all duration-200 cursor-pointer"
            style={{ background: '#101620', border: '1px solid #1a2236' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#253044'
              ;(e.currentTarget as HTMLButtonElement).style.background = '#141c26'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#1a2236'
              ;(e.currentTarget as HTMLButtonElement).style.background = '#101620'
            }}
          >
            <GoogleIcon />
            Continue with Google
          </button>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: '#1a2236' }} />
          <span className="text-[12px] text-[#2e3b52] font-medium">or</span>
          <div className="flex-1 h-px" style={{ background: '#1a2236' }} />
        </div>

        {/* OTP flow */}
        {step === 'initial' ? (
          <div className="flex flex-col gap-3">
            <input
              type="tel"
              placeholder="+91 9999 999999"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="px-4 py-3 rounded-xl text-[14px] text-[#eef2f8] outline-none transition-all duration-200"
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
            <button
              onClick={sendOtp}
              disabled={loading || !phone.trim()}
              className="py-3 rounded-xl text-[14px] font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              style={{ background: '#7c3aed', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }}
            >
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-[12px] text-[#4a566e]">OTP sent to <span className="text-[#8b98b4]">{phone}</span></p>
            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              maxLength={6}
              className="px-4 py-3 rounded-xl text-[20px] font-mono text-[#eef2f8] text-center tracking-[0.4em] outline-none transition-all duration-200"
              style={{ background: '#101620', border: '1px solid #1a2236' }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.08)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = '#1a2236'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
            <button
              onClick={verifyOtp}
              disabled={loading || otp.length !== 6}
              className="py-3 rounded-xl text-[14px] font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              style={{ background: '#7c3aed', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }}
            >
              {loading ? 'Verifying…' : 'Verify OTP'}
            </button>
            <button
              onClick={() => { setStep('initial'); setOtp(''); setError(null) }}
              className="text-[12px] text-[#4a566e] hover:text-[#8b98b4] transition-colors cursor-pointer"
            >
              ← Change number
            </button>
          </div>
        )}
      </div>

      <p className="text-[12px] text-[#2e3b52] text-center mt-4">
        By continuing, you agree to our{' '}
        <a href="/terms" className="text-[#4a566e] hover:text-[#8b98b4] transition-colors">Terms</a>
        {' & '}
        <a href="/privacy" className="text-[#4a566e] hover:text-[#8b98b4] transition-colors">Privacy Policy</a>
      </p>
    </div>
  )
}
