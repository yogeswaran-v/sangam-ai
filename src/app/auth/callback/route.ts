import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Supabase passes OAuth provider errors back as query params
  const providerError = searchParams.get('error_description') ?? searchParams.get('error')
  if (providerError) {
    console.error('[auth/callback] provider error:', providerError)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(providerError)}`
    )
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('[auth/callback] code exchange failed:', error.message)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    )
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent('Sign-in was cancelled or the link expired. Please try again.')}`
  )
}
