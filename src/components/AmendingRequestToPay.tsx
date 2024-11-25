'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VisaDirectPaymentResponse {
  success: boolean
  message?: string
  data?: any
  error?: string
}

interface VisaDirectPaymentData {
  amount: number
  currency: string
  recipientCard: string
  description?: string
}

async function createVisaDirectPayment(paymentData: VisaDirectPaymentData): Promise<VisaDirectPaymentResponse> {
  const response = await fetch('/api/payments/visa-direct/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  })

  return response.json()
}

export default function VisaDirectPayment() {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [recipientCard, setRecipientCard] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VisaDirectPaymentResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const result = await createVisaDirectPayment({
        amount: parseFloat(amount),
        currency,
        recipientCard: recipientCard.replace(/\s/g, ''),
        description
      })
      setResult(result)
    } catch (error) {
      console.error('Error creating payment:', error)
      setError('Failed to create payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Visa Direct Payment</CardTitle>
        <CardDescription>Send money instantly to any Visa card</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="Enter the amount"
              step="0.01"
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipientCard">Recipient Card Number</Label>
            <Input
              id="recipientCard"
              value={recipientCard}
              onChange={(e) => setRecipientCard(e.target.value)}
              required
              placeholder="Enter the recipient's card number"
              pattern="[0-9\s]{13,19}"
              maxLength={19}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description for this payment"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Processing...' : 'Send Payment'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        {error && (
          <div className="text-red-500 mb-2">{error}</div>
        )}
        {result && (
          <div className="w-full">
            <h3 className="font-semibold mb-2">Result:</h3>
            <div className="bg-gray-100 p-2 rounded text-sm">
              <p>Status: {result.success ? 'Success' : 'Failed'}</p>
              {result.message && <p>Message: {result.message}</p>}
              {result.error && <p className="text-red-500">Error: {result.error}</p>}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}