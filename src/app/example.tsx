'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface ExampleComponentProps {
  title: string
}

export default function ExamplePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <ExampleComponent title="Example Page" />
    </div>
  )
}

function ExampleComponent({ title }: ExampleComponentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">This is an example component.</p>
      </CardContent>
    </Card>
  )
}