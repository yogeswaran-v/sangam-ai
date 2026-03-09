import type { Metadata } from 'next'
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  weight: ['400', '500', '600', '700', '800'],
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Sangam.ai — Your AI Team, Assembled',
  description: 'Preset AI agent teams for every business function. Powered by Claude Opus 4.6.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`antialiased ${bricolage.variable} ${jakarta.variable}`}>
        {children}
      </body>
    </html>
  )
}
