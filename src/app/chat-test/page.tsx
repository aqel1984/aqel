'use client'

import { TestScenarios } from './components/TestScenarios'
import { Card } from '@/components/ui/card'

export default function ChatTestPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Apple Business Chat Test Suite</h1>
      
      <div className="w-full">
        <TestScenarios />
      </div>

      <div className="mt-8">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Testing Instructions</h2>
          <div className="space-y-4">
            <p>Use the test scenarios above to validate different chat interactions:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Sales inquiries will be routed to the sales team</li>
              <li>Support requests will be handled by the support team</li>
              <li>Partnership inquiries go to the business development team</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}
