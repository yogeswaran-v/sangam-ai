import type { Metadata } from 'next'
import { Space_Grotesk, DM_Sans } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '700'],
})

export const metadata: Metadata = {
  title: 'Sangam.ai — Your AI Team, Assembled',
  description: 'Preset AI agent teams for every business function. Powered by Claude Opus 4.6.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`antialiased ${spaceGrotesk.variable} ${dmSans.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}
