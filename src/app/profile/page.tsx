'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export default function ProfilePage() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Failed to load profile. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, user])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : profile ? (
            <div className="space-y-2">
              <p><span className="font-semibold">Name:</span> {profile.name}</p>
              <p><span className="font-semibold">Email:</span> {profile.email}</p>
            </div>
          ) : (
            <p>No profile data available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}