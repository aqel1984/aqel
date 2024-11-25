'use client'

import { createClient } from '@supabase/supabase-js'
import { config } from '@/lib/config'

const supabase = createClient(config.supabase.url!, config.supabase.anonKey!)

export function SupabaseExample() {
  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })

    if (error) {
      console.error('Error signing in:', error)
    } else {
      console.log('Signed in successfully:', data)
    }
  }

  return (
    <button onClick={handleSignIn}>Sign in with Google</button>
  )
}