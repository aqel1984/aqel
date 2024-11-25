'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';

interface Payment {
  invoiceNumber: string;
  status: 'completed' | 'failed' | 'pending';
  amount: number;
  currency: string;
  paymentMethod: string;
  timestamp: string;
  error?: string;
}

export default function RecentPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    try {
      const response = await fetch('/api/payment-analytics?limit=10');
      if (!response.ok) throw new Error('Failed to fetch payments');
      const data = await response.json();
      setPayments(data.recentPayments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function downloadReceipt(invoiceNumber: string) {
    try {
      window.open(`/api/receipt?invoice=${invoiceNumber}`, '_blank');
    } catch (err) {
      console.error('Failed to download receipt:', err);
    }
  }

  if (loading) return <div>Loading payments...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!payments.length) return <div>No recent payments</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Recent Payments
        </h3>
      </div>
      <div className="border-t border-gray-200">
        <ul role="list" className="divide-y divide-gray-200">
          {payments.map((payment) => (
            <li key={payment.invoiceNumber} className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Invoice #{payment.invoiceNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(payment.timestamp), 'PPpp')}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {payment.paymentMethod} • ${payment.amount.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      payment.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : payment.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {payment.status}
                  </span>
                  {payment.status === 'completed' && (
                    <button
                      onClick={() => downloadReceipt(payment.invoiceNumber)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Receipt
                    </button>
                  )}
                </div>
              </div>
              {payment.error && (
                <p className="mt-2 text-sm text-red-600">{payment.error}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-gray-50 px-4 py-4 sm:px-6">
        <button
          onClick={fetchPayments}
          className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Refresh Payments
        </button>
      </div>
    </div>
  );
}
