import { Metadata } from 'next';
import { Suspense } from 'react';
import { listPaymentLinks } from '@/lib/services/payment-link';
import { PaymentLinksTable } from './components/PaymentLinksTable';
import { CreatePaymentLinkForm } from './components/CreatePaymentLinkForm';

export const metadata: Metadata = {
  title: 'Payment Links',
  description: 'Manage your payment links',
};

export default async function PaymentLinksPage() {
  const paymentLinks = await listPaymentLinks('admin'); // TODO: Get actual user ID

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Payment Links</h1>
        <CreatePaymentLinkForm />
      </div>

      <Suspense
        fallback={
          <div className="h-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        }
      >
        <PaymentLinksTable paymentLinks={paymentLinks} />
      </Suspense>
    </div>
  );
}
