'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { logger } from '@/lib/logger';

const log = logger('payment-form');

const paymentSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().min(1, 'Currency is required'),
  description: z.string().min(1, 'Description is required'),
  recipientEmail: z.string().email('Valid email is required'),
  sendPaymentLink: z.boolean().default(false),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function PaymentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      sendPaymentLink: false,
    },
  });

  const sendPaymentLink = watch('sendPaymentLink');

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setPaymentUrl(null);
      
      if (data.sendPaymentLink) {
        // Generate and send payment link
        const response = await fetch('/api/payment-links', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to generate payment link');
        }

        const result = await response.json();
        setPaymentUrl(result.paymentUrl);
        setSuccess(true);
        log.info('Payment link generated', { amount: data.amount, currency: data.currency });
      } else {
        // Process direct payment
        const response = await fetch('/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Payment failed');
        }

        setSuccess(true);
        log.info('Payment processed', { amount: data.amount, currency: data.currency });
      }

      reset();
    } catch (err: any) {
      log.error('Payment submission failed', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-500 p-4 rounded-md">
          {paymentUrl ? (
            <>
              <p>Payment link generated and sent!</p>
              <p className="mt-2 text-sm">
                Link: <a href={paymentUrl} className="underline" target="_blank" rel="noopener noreferrer">{paymentUrl}</a>
              </p>
            </>
          ) : (
            'Payment processed successfully!'
          )}
        </div>
      )}

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <input
          type="number"
          step="0.01"
          {...register('amount', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
          Currency
        </label>
        <select
          {...register('currency')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Select currency</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>
        {errors.currency && (
          <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          {...register('description')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={3}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700">
          Recipient Email
        </label>
        <input
          type="email"
          {...register('recipientEmail')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.recipientEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.recipientEmail.message}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          {...register('sendPaymentLink')}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="sendPaymentLink" className="ml-2 block text-sm text-gray-700">
          Generate and send payment link instead of processing payment directly
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Processing...' : sendPaymentLink ? 'Generate Payment Link' : 'Process Payment'}
      </button>
    </form>
  );
}
