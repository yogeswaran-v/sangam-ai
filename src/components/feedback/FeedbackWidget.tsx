'use client'

import { useState } from 'react'

const ratings = ['😞', '😐', '🙂', '😊', '🤩']

export function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')

  async function submit() {
    if (rating === null && !message.trim()) return
    setStatus('submitting')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: rating !== null ? rating + 1 : null, message }),
      })
      if (!res.ok) throw new Error()
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  function reset() {
    setOpen(false)
    setRating(null)
    setMessage('')
    setStatus('idle')
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium text-white transition-all duration-200 cursor-pointer"
        style={{ background: '#7c3aed', boxShadow: '0 4px 24px rgba(124,58,237,0.45)' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Feedback
      </button>

      {/* Modal backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end p-6"
          onClick={e => { if (e.target === e.currentTarget) reset() }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: '#0b1018', border: '1px solid #1a2236', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
          >
            {status === 'done' ? (
              <div className="py-4 text-center flex flex-col gap-3">
                <div className="text-3xl">🙏</div>
                <p className="text-[15px] font-semibold text-[#eef2f8]">Thanks for the feedback!</p>
                <p className="text-[13px]" style={{ color: '#4a566e' }}>It helps us build something you&apos;ll love.</p>
                <button
                  onClick={reset}
                  className="mt-2 text-[13px] text-[#7c3aed] hover:text-[#a78bfa] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold text-[#eef2f8]">Share your feedback</h3>
                  <button
                    onClick={reset}
                    className="text-[#4a566e] hover:text-[#8b98b4] transition-colors cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div>
                  <p className="text-[12px] mb-3" style={{ color: '#4a566e' }}>How&apos;s your experience so far?</p>
                  <div className="flex gap-2">
                    {ratings.map((emoji, i) => (
                      <button
                        key={i}
                        onClick={() => setRating(i)}
                        className="flex-1 py-2 rounded-xl text-xl transition-all duration-150 cursor-pointer"
                        style={{
                          background: rating === i ? 'rgba(124,58,237,0.15)' : '#101620',
                          border: `1px solid ${rating === i ? 'rgba(167,139,250,0.4)' : '#1a2236'}`,
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="What's working? What's confusing? What do you wish existed?"
                  rows={3}
                  className="resize-none px-4 py-3 rounded-xl text-[13px] text-[#eef2f8] outline-none transition-all duration-200 w-full"
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

                {status === 'error' && (
                  <p className="text-[12px] text-[#f87171]">Something went wrong. Try again.</p>
                )}

                <button
                  onClick={submit}
                  disabled={status === 'submitting' || (rating === null && !message.trim())}
                  className="py-2.5 rounded-xl text-[14px] font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  style={{ background: '#7c3aed', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }}
                >
                  {status === 'submitting' ? 'Sending…' : 'Send feedback'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
