import React from 'react'
import Image from 'next/image'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl">Welcome to Jehad Aqel Ltd</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl mb-8">Discover our premium shea butter products.</p>
          <Image 
            src="/path-to-your-image.jpg" 
            alt="Shea butter products" 
            width={600} 
            height={400}
            className="rounded-lg shadow-md mb-8"
          />
          <Link href="/products">
            <Button>Explore Our Products</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}