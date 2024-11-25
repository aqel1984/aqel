'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

interface Profile {
  id: string
  name: string
  email: string
}

export default function UsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfiles() {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')

        if (error) throw error
        setProfiles(data)
      } catch (error) {
        console.error('Error fetching profiles:', error)
        setError('Failed to load users. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfiles()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <ul className="space-y-4">
              {profiles.map((profile) => (
                <li key={profile.id} className="bg-card-secondary rounded-lg p-4">
                  <span className="font-semibold">{profile.name}</span> ({profile.email})
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}