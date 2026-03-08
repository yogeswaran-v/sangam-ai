import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sangam.ai — Your AI Team, Assembled',
  description: 'Preset AI agent teams for every business function. Powered by Claude Opus 4.6.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
