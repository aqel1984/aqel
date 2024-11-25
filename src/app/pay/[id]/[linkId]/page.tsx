'use client';

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getPaymentLink } from '@/lib/payment-links';
import PaymentProcessor from './PaymentProcessor';
import { logger } from '@/lib/logger';

const log = logger('payment-page');

interface PageProps {
  params: {
    id: string;
    linkId: string;
  };
}

export default async function PaymentPage({ params }: PageProps) {
  try {
    const paymentLink = await getPaymentLink(params.id);

    if (!paymentLink) {
      log.warn('Payment link not found', { id: params.id });
      notFound();
    }

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Payment
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="space-y-6">
              <div>
                <div className="mt-1 text-center">
                  <p className="text-lg font-medium text-gray-900">
                    Amount: {paymentLink.amount} {paymentLink.currency}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {paymentLink.description}
                  </p>
                </div>
              </div>

              <Suspense fallback={<div>Loading payment processor...</div>}>
                <PaymentProcessor
                  id={params.id}
                  amount={paymentLink.amount}
                  currency={paymentLink.currency}
                  description={paymentLink.description}
                  recipientEmail={paymentLink.recipientEmail}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    log.error('Error loading payment page', error);
    throw new Error('Failed to load payment page');
  }
}
