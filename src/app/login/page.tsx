import { Metadata } from 'next'
import Auth from '@/components/Auth'
import { Navigation } from '@/components/Navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: 'Login - Aqel Jehad Ltd',
  description: 'Login to your Aqel Jehad Ltd account to access exclusive features and manage your orders.',
}

export default function Login() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Login to Your Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Auth />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}