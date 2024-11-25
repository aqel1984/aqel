'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { logger } from '@/lib/logger';

const log = logger('payment-success');

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      if (!searchParams) {
        throw new Error('No search parameters found');
      }
      
      const paymentIntentId = searchParams.get('payment_intent');
      if (!paymentIntentId) {
        throw new Error('Payment verification failed');
      }

      // Verify payment status
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentIntentId }),
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      log.info('Payment verified successfully', { paymentIntentId });
    } catch (err: any) {
      log.error('Payment verification failed', err);
      setError(err.message || 'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">Verifying payment...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="text-red-600 mb-4">{error}</div>
              <p className="text-gray-500">
                Please contact support if you believe this is an error.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="text-green-600 text-4xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful
            </h2>
            <p className="text-gray-500">
              Thank you for your payment. A confirmation email has been sent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
