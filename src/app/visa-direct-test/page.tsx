'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const TEST_AMOUNTS = [
  { label: '$10.00', amount: 10.00 },
  { label: '$25.00', amount: 25.00 },
  { label: '$50.00', amount: 50.00 },
] as const;

const TEST_CARDS = [
  { label: 'Test Card 1', number: '4111111111111111' },
  { label: 'Test Card 2', number: '4242424242424242' },
  { label: 'Test Card 3', number: '4000056655665556' },
] as const;

type Amount = typeof TEST_AMOUNTS[number]['amount'];
type CardNumber = typeof TEST_CARDS[number]['number'];

export default function VisaDirectTestPage() {
  const [selectedAmount, setSelectedAmount] = useState<Amount>(TEST_AMOUNTS[0]?.amount ?? 10.00);
  const [selectedCard, setSelectedCard] = useState<CardNumber>(TEST_CARDS[0]?.number ?? '4111111111111111');
  const [cardHolder, setCardHolder] = useState('John Doe');
  const [expiryMonth, setExpiryMonth] = useState('12');
  const [expiryYear, setExpiryYear] = useState('2024');
  const [cvv, setCvv] = useState('123');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await fetch('/api/process-visa-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedAmount,
          card: {
            number: selectedCard,
            holder: cardHolder,
            expiryMonth,
            expiryYear,
            cvv,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process Visa Direct payment');
      }

      toast({
        title: 'Success',
        description: 'Visa Direct payment processed successfully',
      });
    } catch (error) {
      console.error('Visa Direct payment failed:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process Visa Direct payment',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Visa Direct Test</h1>
      <Card>
        <CardHeader>
          <CardTitle>Test Visa Direct Payment</CardTitle>
          <CardDescription>
            Use test card numbers to simulate Visa Direct payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <Select
                value={selectedAmount.toString()}
                onValueChange={(value) => {
                  const amount = parseFloat(value);
                  if (TEST_AMOUNTS.some(a => a.amount === amount)) {
                    setSelectedAmount(amount as Amount);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select amount" />
                </SelectTrigger>
                <SelectContent>
                  {TEST_AMOUNTS.map((amount) => (
                    <SelectItem key={amount.amount} value={amount.amount.toString()}>
                      {amount.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Card Number</label>
              <Select
                value={selectedCard}
                onValueChange={(value) => {
                  if (TEST_CARDS.some(c => c.number === value)) {
                    setSelectedCard(value as CardNumber);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select test card" />
                </SelectTrigger>
                <SelectContent>
                  {TEST_CARDS.map((card) => (
                    <SelectItem key={card.number} value={card.number}>
                      {card.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Card Holder</label>
              <Input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="Card holder name"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Month</label>
                <Input
                  type="text"
                  value={expiryMonth}
                  onChange={(e) => setExpiryMonth(e.target.value)}
                  placeholder="MM"
                  maxLength={2}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <Input
                  type="text"
                  value={expiryYear}
                  onChange={(e) => setExpiryYear(e.target.value)}
                  placeholder="YYYY"
                  maxLength={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CVV</label>
                <Input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  maxLength={4}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Process Payment'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
