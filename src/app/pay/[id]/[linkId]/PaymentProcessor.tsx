'use client';

import { useState } from 'react';
import { logger } from '@/lib/logger';
import { toast } from '@/components/ui/use-toast';

const log = logger('payment-processor');

interface PaymentProcessorProps {
  id: string;
  amount: number;
  currency: string;
  description: string;
  recipientEmail: string;
}

export default function PaymentProcessor({
  id,
  amount,
  currency,
  description,
  recipientEmail,
}: PaymentProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWisePayment = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // Create Wise payment
      const response = await fetch('/api/payments/wise/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          description,
          id,
          recipientEmail,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Wise payment');
      }

      const { redirectUrl } = await response.json();
      
      // Show success message
      toast({
        title: 'Payment Initiated',
        description: 'Your payment is being processed.',
        variant: 'default'
      });

      // Redirect to Wise payment page
      window.location.href = redirectUrl;
      log.info('Redirecting to Wise payment', { id, amount, redirectUrl });
    } catch (err: any) {
      log.error('Wise payment creation failed', err);
      setError(err.message || 'Failed to create Wise payment');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={handleWisePayment}
          disabled={isProcessing}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isProcessing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : (
            'Pay Securely with Wise'
          )}
        </button>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            You will be redirected to Wise to complete your payment securely
          </p>
        </div>

        <div className="flex items-center justify-center space-x-4 mt-6">
          <img src="/wise-logo.svg" alt="Wise" className="h-6" />
          <div className="flex items-center">
            <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="ml-2 text-xs text-gray-600">Secure payment</span>
          </div>
        </div>
      </div>
    </div>
  );
}
