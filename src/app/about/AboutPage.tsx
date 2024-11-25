import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">About Jehad Aqel Ltd</h1>
      <Card>
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl mb-4">
            We are dedicated to providing high-quality shea butter products to our customers.
          </p>
          <p className="text-xl mb-4">
            Our mission is to deliver natural and effective skincare solutions while supporting sustainable practices.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}