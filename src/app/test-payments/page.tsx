'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckIcon, CopyIcon } from "@radix-ui/react-icons"

interface PaymentLinkResponse {
  success: boolean
  paymentLink?: string
  error?: string
}

export default function TestPaymentsPage() {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PaymentLinkResponse | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCreateApplePayLink = async () => {
    setLoading(true)
    setResult(null)
    setCopied(false)

    try {
      const response = await fetch('/api/payments/apple-pay/create-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency,
          description: description || 'Payment via Apple Pay'
        }),
      })

      const data = await response.json()
      
      // Update the payment link to use the current domain instead of example.com
      if (data.success && data.paymentLink) {
        const url = new URL(data.paymentLink);
        url.protocol = window.location.protocol;
        url.host = window.location.host;
        data.paymentLink = url.toString();
      }
      
      setResult(data)
    } catch (error) {
      console.error('Error creating Apple Pay link:', error)
      setResult({
        success: false,
        error: 'Failed to create Apple Pay payment link'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateVisaDirectLink = async () => {
    setLoading(true)
    setResult(null)
    setCopied(false)

    try {
      const response = await fetch('/api/payments/visa-direct/create-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency,
          description: description || 'Payment via Visa Direct'
        }),
      })

      const data = await response.json()
      
      // Update the payment link to use the current domain instead of example.com
      if (data.success && data.paymentLink) {
        const url = new URL(data.paymentLink);
        url.protocol = window.location.protocol;
        url.host = window.location.host;
        data.paymentLink = url.toString();
      }
      
      setResult(data)
    } catch (error) {
      console.error('Error creating Visa Direct link:', error)
      setResult({
        success: false,
        error: 'Failed to create Visa Direct payment link'
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (result?.paymentLink) {
      try {
        await navigator.clipboard.writeText(result.paymentLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-10">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Test Payment Links</CardTitle>
            <CardDescription>Generate test payment links for different payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="apple-pay" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="apple-pay">Apple Pay</TabsTrigger>
                <TabsTrigger value="visa-direct">Visa Direct</TabsTrigger>
              </TabsList>

              <TabsContent value="apple-pay">
                <div className="space-y-4 mt-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="apple-pay-amount">Amount</Label>
                    <Input
                      id="apple-pay-amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                    />
                  </div>

                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="apple-pay-currency">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger id="apple-pay-currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="apple-pay-description">Description (Optional)</Label>
                    <Input
                      id="apple-pay-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter payment description"
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleCreateApplePayLink}
                    disabled={loading || !amount}
                  >
                    {loading ? 'Generating...' : 'Generate Apple Pay Link'}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="visa-direct">
                <div className="space-y-4 mt-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="visa-direct-amount">Amount</Label>
                    <Input
                      id="visa-direct-amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                    />
                  </div>

                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="visa-direct-currency">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger id="visa-direct-currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="visa-direct-description">Description (Optional)</Label>
                    <Input
                      id="visa-direct-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter payment description"
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleCreateVisaDirectLink}
                    disabled={loading || !amount}
                  >
                    {loading ? 'Generating...' : 'Generate Visa Direct Link'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {result && (
              <div className="mt-8">
                {result.success ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Input value={result.paymentLink} readOnly />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyToClipboard}
                        className="shrink-0"
                      >
                        {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-500">{result.error}</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
