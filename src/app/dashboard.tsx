'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

export default function Dashboard() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const user = useUser()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/signin')
    } else {
      setLoading(false)
    }
  }, [user, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
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
          <p className="mb-4">You are signed in as: {user?.email}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSignOut} variant="outline">Sign Out</Button>
        </CardFooter>
      </Card>
    </div>
  )
}