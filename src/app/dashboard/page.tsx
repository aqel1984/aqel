'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Spinner } from '@/components/ui/spinner'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        if (!user) {
          router.push('/signin')
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }
    getUser()
  }, [router, supabase.auth])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to your Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <>
              <p className="mb-4">You are signed in as: {user.email}</p>
              <Button onClick={handleSignOut}>Sign Out</Button>
            </>
          ) : (
            <p>You are not signed in. Please sign in to view your dashboard.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}