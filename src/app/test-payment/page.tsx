'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { FormData, FormErrors } from '@/types/payment';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

interface PaymentResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export default function TestPayment() {
  const [formData, setFormData] = useState<FormData>({
    amount: '10.00',
    recipientName: '',
    iban: '',
    email: '',
    paymentMethod: 'applepay'
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<PaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!formData.recipientName.trim()) {
      newErrors.recipientName = 'Recipient name is required';
    }
    
    if (formData.paymentMethod === 'iban') {
      if (!formData.iban.trim()) {
        newErrors.iban = 'IBAN is required';
      } else if (!/^[A-Z]{2}\d{2}[A-Z0-9]{4,32}$/.test(formData.iban.replace(/\s/g, ''))) {
        newErrors.iban = 'Please enter a valid IBAN';
      }
    } else {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required for Apple Pay';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      const endpoint = formData.paymentMethod === 'iban' 
        ? '/api/payments/test'
        : '/api/payments/apple-pay';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          recipientName: formData.recipientName,
          ...(formData.paymentMethod === 'iban' 
            ? { iban: formData.iban.replace(/\s/g, '') }
            : { email: formData.email }
          ),
        }),
      });

      const data: PaymentResponse = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.error?.message || 'Payment failed';
        throw new Error(errorMessage);
      }

      setStatus(data);
      // Reset form on success
      setFormData({
        amount: '',
        recipientName: '',
        iban: '',
        email: '',
        paymentMethod: 'applepay'
      });

      // Show success message
      toast({
        title: "Success!",
        description: data.message || "Payment processed successfully",
      });

      // If we have a transaction ID, redirect to success page
      if (data.transactionId) {
        router.push(`/payment/success?transactionId=${data.transactionId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Test Payment</h1>
          <p className="mt-2 text-gray-600">Enter payment details below</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Payment Method</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="applepay"
                  checked={formData.paymentMethod === 'applepay'}
                  onChange={() => setFormData(prev => ({ ...prev, paymentMethod: 'applepay' }))}
                  className="mr-2"
                />
                Apple Pay
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="iban"
                  checked={formData.paymentMethod === 'iban'}
                  onChange={() => setFormData(prev => ({ ...prev, paymentMethod: 'iban' }))}
                  className="mr-2"
                />
                IBAN Transfer
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Amount (USD)</label>
            <input
              type="number"
              name="amount"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              className={clsx(
                "block w-full rounded-md shadow-sm sm:text-sm",
                errors.amount
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              )}
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Recipient Name</label>
            <input
              type="text"
              name="recipientName"
              value={formData.recipientName}
              onChange={handleChange}
              className={clsx(
                "block w-full rounded-md shadow-sm sm:text-sm",
                errors.recipientName
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              )}
            />
            {errors.recipientName && (
              <p className="mt-1 text-sm text-red-600">{errors.recipientName}</p>
            )}
          </div>

          {formData.paymentMethod === 'iban' ? (
            <div>
              <label className="block text-sm font-medium mb-1">IBAN</label>
              <input
                type="text"
                name="iban"
                value={formData.iban}
                onChange={handleChange}
                className={clsx(
                  "block w-full rounded-md shadow-sm sm:text-sm",
                  errors.iban
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                )}
              />
              {errors.iban && (
                <p className="mt-1 text-sm text-red-600">{errors.iban}</p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={clsx(
                  "block w-full rounded-md shadow-sm sm:text-sm",
                  errors.email
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                )}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={clsx(
              "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white",
              loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            )}
          >
            {loading ? "Processing..." : "Submit Payment"}
          </button>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mt-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {status && (
            <div className="rounded-md bg-green-50 p-4 mt-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Success</h3>
                  <div className="mt-2 text-sm text-green-700">
                    {status.message || 'Payment processed successfully'}
                    {status.transactionId && (
                      <p className="mt-1">Transaction ID: {status.transactionId}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
