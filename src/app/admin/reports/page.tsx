'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PaymentReport } from '@/lib/services/payment-reports';

const reportFiltersSchema = z.object({
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  currency: z.string().length(3).nullish(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).nullish(),
  minAmount: z.coerce.number().nullish(),
  maxAmount: z.coerce.number().nullish(),
  name: z.string().nullish(),
});

type ReportFilters = z.infer<typeof reportFiltersSchema>;

export default function ReportsPage() {
  const [report, setReport] = useState<PaymentReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultValues = {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] as string,
    endDate: new Date().toISOString().split('T')[0] as string,
    currency: null,
    status: null,
    minAmount: null,
    maxAmount: null,
    name: null
  } as const;

  const form = useForm<ReportFilters>({
    resolver: zodResolver(reportFiltersSchema),
    defaultValues
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = async (data: ReportFilters) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await fetch(`/api/reports?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate report');
      }

      setReport(result.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = async (data: ReportFilters) => {
    try {
      const params = new URLSearchParams();
      Object.entries({ ...data, format: 'csv' }).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, value.toString());
        }
      });
      window.location.href = `/api/reports?${params}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download CSV');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Payment Reports</h1>

      {/* Filters Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              {...register('startDate')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              {...register('endDate')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Currency</label>
            <select
              {...register('currency')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Currencies</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              {...register('status')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Min Amount</label>
            <input
              type="number"
              {...register('minAmount')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Max Amount</label>
            <input
              type="number"
              {...register('maxAmount')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(downloadCSV)()}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Download CSV
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Report Results */}
      {report && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Report Results</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                ${report.totalAmount.toFixed(2)}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Successful Payments</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {report.successfulPayments}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Failed Payments</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {report.failedPayments}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Conversion Rate</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {report.conversionRate.toFixed(1)}%
              </dd>
            </div>
          </div>

          {/* Currency Breakdown */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Currency Breakdown</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(report.currencyBreakdown).map(([currency, data]) => (
                  <div key={currency} className="bg-white rounded-md p-4">
                    <dt className="text-sm font-medium text-gray-500">{currency}</dt>
                    <dd className="mt-1">
                      <div className="text-2xl font-semibold text-gray-900">
                        ${data.amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {data.count} payments
                      </div>
                    </dd>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Volume</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.timeline.map((day) => (
                    <tr key={day.date}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(day.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${day.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {day.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
