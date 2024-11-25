'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'

export function SignInWithAppleButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Apple:', error)
      alert('Error signing in with Apple. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading}
      className="w-full bg-black hover:bg-gray-800 text-white"
    >
      {isLoading ? 'Signing in...' : 'Sign in with Apple'}
    </Button>
  )
}