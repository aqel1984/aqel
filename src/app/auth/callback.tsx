'use client';

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AuthCallback() {
  const router = useRouter()
  const supabaseClient = useSupabaseClient()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabaseClient.auth.getSession()
        if (error) throw error
        if (data.session) {
          await router.push('/dashboard')
        } else {
          throw new Error('No session found')
        }
      } catch (error) {
        console.error('Authentication error:', error)
        setError('Unable to authenticate. Please try again.')
        setTimeout(() => router.push('/auth/signin'), 3000)
      }
    }

    handleAuthCallback()
  }, [router, supabaseClient.auth])

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <Spinner size="lg" />
              <p className="text-center text-lg font-medium">Authenticating...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}