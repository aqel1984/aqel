'use client';

import React, { useState } from 'react';
import { useAzureAuth } from '@/hooks/useAzureAuth';

interface PaymentFormData {
  senderCardNumber: string;
  recipientCardNumber: string;
  amount: number;
  currency: string;
  senderName: string;
  recipientName: string;
  purpose?: string;
}

interface PaymentStatus {
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
  transactionId?: string;
}

export function VisaDirectPayment() {
  const { isAuthenticated, login } = useAzureAuth();
  const [formData, setFormData] = useState<PaymentFormData>({
    senderCardNumber: '',
    recipientCardNumber: '',
    amount: 0,
    currency: 'GBP',
    senderName: '',
    recipientName: '',
    purpose: '',
  });
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'idle',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      login();
      return;
    }

    setPaymentStatus({ status: 'processing' });

    try {
      const response = await fetch('/api/payments/visa-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Payment failed');
      }

      setPaymentStatus({
        status: 'success',
        message: 'Payment processed successfully',
        transactionId: data.transactionId,
      });

      // Reset form
      setFormData({
        senderCardNumber: '',
        recipientCardNumber: '',
        amount: 0,
        currency: 'GBP',
        senderName: '',
        recipientName: '',
        purpose: '',
      });
    } catch (error: any) {
      setPaymentStatus({
        status: 'error',
        message: error.message || 'Payment failed',
      });
    }
  };

  const checkTransactionStatus = async () => {
    if (!paymentStatus.transactionId) return;

    try {
      const response = await fetch(
        `/api/payments/visa-direct?transactionId=${paymentStatus.transactionId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Status check failed');
      }

      setPaymentStatus((prev) => ({
        ...prev,
        message: `Transaction ${data.status.toLowerCase()}`,
      }));
    } catch (error: any) {
      setPaymentStatus((prev) => ({
        ...prev,
        message: error.message || 'Status check failed',
      }));
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Visa Direct Payment</h2>

      {!isAuthenticated && (
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Please sign in to make a payment
          </p>
          <button
            onClick={login}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      )}

      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sender Card Number
            </label>
            <input
              type="text"
              name="senderCardNumber"
              value={formData.senderCardNumber}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Recipient Card Number
            </label>
            <input
              type="text"
              name="recipientCardNumber"
              value={formData.recipientCardNumber}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sender Name
            </label>
            <input
              type="text"
              name="senderName"
              value={formData.senderName}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Recipient Name
            </label>
            <input
              type="text"
              name="recipientName"
              value={formData.recipientName}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Purpose (Optional)
            </label>
            <input
              type="text"
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={paymentStatus.status === 'processing'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {paymentStatus.status === 'processing'
              ? 'Processing...'
              : 'Make Payment'}
          </button>
        </form>
      )}

      {paymentStatus.status !== 'idle' && (
        <div
          className={`mt-4 p-4 rounded ${
            paymentStatus.status === 'success'
              ? 'bg-green-100 text-green-700'
              : paymentStatus.status === 'error'
              ? 'bg-red-100 text-red-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          <p className="text-sm">{paymentStatus.message}</p>
          {paymentStatus.transactionId && (
            <div className="mt-2">
              <p className="text-xs">
                Transaction ID: {paymentStatus.transactionId}
              </p>
              <button
                onClick={checkTransactionStatus}
                className="mt-2 text-sm underline"
              >
                Check Status
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
