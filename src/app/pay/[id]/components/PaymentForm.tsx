'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { PaymentLink } from '@/lib/services/payment-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

interface PaymentFormProps {
  paymentLink: PaymentLink;
}

const paymentFormSchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  customerEmail: z.string().email('Invalid email address'),
});

export function PaymentForm({ paymentLink }: PaymentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      const validatedData = paymentFormSchema.parse(formData);

      // Create payment
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: paymentLink.amount,
          currency: paymentLink.currency,
          description: paymentLink.description,
          metadata: {
            ...paymentLink.metadata,
            paymentLinkId: paymentLink.id,
          },
          customerName: validatedData.customerName,
          customerEmail: validatedData.customerEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process payment');
      }

      // Update payment link status
      await fetch(`/api/payment-links/${paymentLink.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: data.paymentId,
          customerName: validatedData.customerName,
          customerEmail: validatedData.customerEmail,
        }),
      });

      // Redirect to success page
      router.push(`/pay/${paymentLink.id}/success?paymentId=${data.paymentId}`);
    } catch (error) {
      console.error('Payment failed:', error);
      
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast({
            title: "Validation Error",
            description: err.message,
            variant: "destructive"
          });
        });
        return;
      } else {
        toast({
          title: "Payment Failed",
          description: error instanceof Error ? error.message : 'An error occurred',
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label
          htmlFor="customerName"
          className="block text-sm font-medium text-gray-700"
        >
          Your Name
        </Label>
        <Input
          id="customerName"
          name="customerName"
          type="text"
          required
          value={formData.customerName}
          onChange={handleInputChange}
          className="mt-1"
          disabled={loading}
        />
      </div>

      <div>
        <Label
          htmlFor="customerEmail"
          className="block text-sm font-medium text-gray-700"
        >
          Email Address
        </Label>
        <Input
          id="customerEmail"
          name="customerEmail"
          type="email"
          required
          value={formData.customerEmail}
          onChange={handleInputChange}
          className="mt-1"
          disabled={loading}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </Button>

      <p className="text-sm text-gray-500 text-center mt-4">
        Secure payment processed by Wise
      </p>
    </form>
  );
}
