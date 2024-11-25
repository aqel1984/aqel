'use client';

import { useState } from 'react';
import { logger } from '@/lib/logger';
import { toast } from '@/components/ui/use-toast';
import { PaymentLink } from '@/lib/services/payment-link';

const log = logger('payment-processor');

interface PaymentProcessorProps {
  paymentLink: PaymentLink;
}

export function PaymentProcessor({ paymentLink }: PaymentProcessorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const customerName = formData.get('customerName') as string;
    const customerEmail = formData.get('customerEmail') as string;

    try {
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentLinkId: paymentLink.id,
          customerName,
          customerEmail,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process payment');
      }

      const data = await response.json();
      
      // Show success message
      toast({
        title: 'Payment Initiated',
        description: 'Your payment is being processed.',
        variant: 'default'
      });

      // Redirect to success page
      window.location.href = `/pay/${paymentLink.id}/success?transferId=${data.transferId}`;
    } catch (err) {
      log.error('Failed to process payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to process payment. Please try again.');
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to process payment',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="customerName"
          className="block text-sm font-medium text-gray-700"
        >
          Your Name
        </label>
        <input
          id="customerName"
          name="customerName"
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="customerEmail"
          className="block text-sm font-medium text-gray-700"
        >
          Email Address
        </label>
        <input
          id="customerEmail"
          name="customerEmail"
          type="email"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          disabled={loading}
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}
