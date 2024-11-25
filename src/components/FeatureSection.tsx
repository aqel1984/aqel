import React from 'react'
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"

interface Feature {
  title: string;
  description: string;
}

export function FeatureSection() {
  const features: Feature[] = [
    { title: "Quality", description: "We never compromise on the quality of our products" },
    { title: "Sustainability", description: "We support environmentally friendly practices" },
    { title: "Fair Trade", description: "We ensure fair compensation for all our partners" },
  ]

  return (
    <section aria-labelledby="features-heading" className="py-12">
      <h2 id="features-heading" className="sr-only">Our Features</h2>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}