import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getPaymentLink } from '@/lib/services/payment-link';
import { PaymentProcessor } from './components/PaymentProcessor';
import type { Metadata } from 'next';

interface PaymentPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PaymentPageProps): Promise<Metadata> {
  try {
    const paymentLink = await getPaymentLink(params.id);

    if (!paymentLink) {
      return {
        title: 'Payment Not Found',
        description: null,
      };
    }

    return {
      title: `Pay ${paymentLink.amount} ${paymentLink.currency}`,
      description: paymentLink.description || null,
    };
  } catch (error) {
    return {
      title: 'Error',
      description: null,
    };
  }
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  try {
    const paymentLink = await getPaymentLink(params.id);

    if (!paymentLink) {
      notFound();
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">
              Pay {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: paymentLink.currency,
              }).format(paymentLink.amount)}
            </h1>
            {paymentLink.description && (
              <p className="text-gray-600">{paymentLink.description}</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md">
            <Suspense fallback={<div>Loading payment processor...</div>}>
              <PaymentProcessor paymentLink={paymentLink} />
            </Suspense>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h1 className="text-red-700 font-semibold">Error</h1>
            <p className="text-red-600">
              {error instanceof Error ? error.message : 'Failed to load payment link'}
            </p>
          </div>
        </div>
      </div>
    );
  }
}
