import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPaymentLink } from '@/lib/services/payment-link';
import { getPaymentById } from '@/lib/services/payment-tracking';
import { CheckIcon } from '@radix-ui/react-icons';

interface SuccessPageProps {
  params: {
    id: string;
  };
  searchParams: {
    paymentId?: string;
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: SuccessPageProps): Promise<Metadata> {
  try {
    const paymentLink = await getPaymentLink(params.id);

    if (!paymentLink) {
      return {
        title: 'Payment Not Found',
        description: null,
      };
    }

    const payment = searchParams.paymentId
      ? await getPaymentById(searchParams.paymentId)
      : null;

    if (!payment) {
      return {
        title: 'Payment Not Found',
        description: null,
      };
    }

    return {
      title: 'Payment Success',
      description: `Payment of ${payment.amount} ${payment.currency} was successful`,
    };
  } catch (error) {
    return {
      title: 'Error',
      description: null,
    };
  }
}

export default async function SuccessPage({
  params,
  searchParams,
}: SuccessPageProps) {
  try {
    const paymentLink = await getPaymentLink(params.id);

    if (!paymentLink) {
      notFound();
    }

    const payment = searchParams.paymentId
      ? await getPaymentById(searchParams.paymentId)
      : null;

    if (!payment) {
      notFound();
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <CheckIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful
            </h1>
            <p className="text-gray-600">
              Thank you for your payment. A receipt has been sent to your email.
            </p>
          </div>

          <div className="space-y-4">
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Amount Paid</span>
                <span className="text-lg font-semibold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: payment.currency,
                  }).format(payment.amount)}
                </span>
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Payment ID</span>
                <span className="text-sm font-mono text-gray-800">
                  {payment.id}
                </span>
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Date</span>
                <span className="text-sm text-gray-800">
                  {new Date(payment.createdAt).toLocaleString()}
                </span>
              </div>

              {payment.customerEmail && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Email</span>
                  <span className="text-sm text-gray-800">
                    {payment.customerEmail}
                  </span>
                </div>
              )}
            </div>

            {payment.metadata && payment.metadata['reference'] && (
              <div className="text-sm text-gray-600 mt-4">
                Reference: {payment.metadata['reference']}
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              If you have any questions, please contact our support team.
            </p>
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
              {error instanceof Error ? error.message : 'Failed to load payment details'}
            </p>
          </div>
        </div>
      </div>
    );
  }
}
