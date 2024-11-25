import React from 'react'
import { Button } from "@/components/ui/button"

interface ExampleComponentProps {
  title: string
}

const ExampleComponent: React.FC<ExampleComponentProps> = ({ title }) => {
  return (
    <div className="p-4 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <p className="mb-4">This is an example component to resolve the render error.</p>
      <Button>
        Click me
        <span className="sr-only">Perform action</span>
      </Button>
    </div>
  )
}

export default ExampleComponent