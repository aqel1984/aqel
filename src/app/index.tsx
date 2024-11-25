import { Metadata } from 'next'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Aqel Jehad LTD - Home',
  description: 'Welcome to Aqel Jehad LTD, your premier supplier of premium raw materials.',
}

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center">Welcome to Aqel Jehad LTD</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-xl mb-6">Your premier supplier of premium raw materials.</p>
          <Button asChild>
            <Link href="/products">View Our Products</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}