'use client'

import { useState } from 'react'

export interface FaqItem {
  question: string
  answer: string
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => {
        const isOpen = openIndex === i
        return (
          <div
            key={item.question}
            className="rounded-2xl border transition-colors duration-200"
            style={{
              background: '#0b1018',
              borderColor: isOpen ? 'rgba(167,139,250,0.3)' : '#1a2236',
            }}
          >
            <button
              type="button"
              id={`faq-button-${i}`}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${i}`}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex min-h-[56px] w-full cursor-pointer items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left"
            >
              <span className="text-[15px] font-semibold leading-snug text-[#eef2f8]">
                {item.question}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="flex-shrink-0 text-[#a78bfa] transition-transform duration-200"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-button-${i}`}
              className="faq-answer"
              data-open={isOpen}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-[14px] leading-relaxed text-[#8b98b4]">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
