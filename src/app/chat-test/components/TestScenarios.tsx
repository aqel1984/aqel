'use client'

import React from 'react'
import AppleBusinessChat from '@/components/AppleBusinessChat'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageCircle } from 'lucide-react'
import { dynamics365 } from '@/services/analytics.service'

interface Scenario {
  id: string
  name: string
  description: string
  icon: React.ComponentType
  intent: string
  group: string
  priority: string
  variants: readonly string[]
}

const scenarios = [
  {
    id: 'sales',
    name: 'Sales Inquiry',
    description: 'Test sales-related chat scenarios',
    icon: MessageCircle,
    intent: 'sales',
    group: 'sales_team',
    priority: 'high',
    variants: ['default', 'outline', 'secondary', 'ghost']
  },
  {
    id: 'support',
    name: 'Customer Support',
    description: 'Test support-related chat scenarios',
    icon: MessageCircle,
    intent: 'support',
    group: 'support_team',
    priority: 'normal',
    variants: ['default', 'outline']
  },
  {
    id: 'partnership',
    name: 'Business Partnership',
    description: 'Test partnership inquiries',
    icon: MessageCircle,
    intent: 'partnership',
    group: 'business_dev',
    priority: 'normal',
    variants: ['default']
  }
] as const satisfies readonly Scenario[]

export function TestScenarios() {
  const [activeScenario, setActiveScenario] = React.useState<Scenario>(scenarios[0])
  const [sessionId, setSessionId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const cleanup = () => {
      dynamics365.clearSession()
    }

    try {
      const newSessionId = dynamics365.initializeSession()
      setSessionId(newSessionId)
      return cleanup
    } catch (error) {
      console.error('Failed to initialize session:', error)
      return cleanup
    }
  }, [])

  return (
    <div className="flex flex-col space-y-4">
      <Tabs defaultValue="scenarios" className="w-full">
        <TabsList>
          <TabsTrigger value="scenarios">Test Scenarios</TabsTrigger>
        </TabsList>
        <TabsContent value="scenarios">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((scenario) => (
              <Card
                key={scenario.id}
                className={`cursor-pointer p-4 hover:bg-accent ${
                  activeScenario?.id === scenario.id ? 'bg-accent' : ''
                }`}
                onClick={() => setActiveScenario(scenario)}
              >
                <div className="flex items-center space-x-2">
                  {scenario.icon && <scenario.icon className="h-5 w-5" />}
                  <h3 className="font-semibold">{scenario.name}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {scenario.description}
                </p>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {activeScenario && sessionId && (
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Default Style</h2>
            <AppleBusinessChat 
              style="default"
              variant="default"
              buttonText="Start Chat"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Card Style</h2>
            <div className="w-64 p-4 border rounded-lg">
              <AppleBusinessChat 
                style="card"
                variant="outline"
                buttonText="Contact Support"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Minimal Style</h2>
            <AppleBusinessChat 
              style="minimal"
              variant="link"
              buttonText="Quick Chat"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Custom Inquiry Types</h2>
            <div className="space-y-4">
              <AppleBusinessChat
                style="default"
                variant="default"
                buttonText="Technical Support"
              />
              <AppleBusinessChat 
                style="default"
                variant="secondary"
                buttonText="Sales Inquiry"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
