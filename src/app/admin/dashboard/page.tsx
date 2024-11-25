import { Metadata } from 'next';
import { Suspense } from 'react';
import { 
  getPaymentStats, 
  getPaymentTimeSeries,
  getCurrencyDistribution,
  getConversionRate,
} from '@/lib/services/analytics';
import { StatsCard } from './components/StatsCard';
import PaymentChart from './components/PaymentChart';
import { CurrencyDistribution } from './components/CurrencyDistribution';
import PaymentAnalytics from './components/PaymentAnalytics';
import RecentPayments from './components/RecentPayments';
import RefundRequests from './components/RefundRequests';
import DisputesList from './components/DisputesList';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Payment analytics dashboard',
};

export default async function DashboardPage() {
  // Get date range for analytics (last 30 days)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  // Fetch analytics data
  const stats = await getPaymentStats(startDate, endDate);
  const timeSeriesData = await getPaymentTimeSeries(startDate, endDate, 'day');
  const currencyData = await getCurrencyDistribution(startDate, endDate);
  const conversionData = await getConversionRate(startDate, endDate);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Revenue"
          value={`$${stats.totalAmount.toFixed(2)}`}
          description="Last 30 days"
        />
        <StatsCard
          title="Success Rate"
          value={`${stats.successRate.toFixed(1)}%`}
          trend={{
            value: 5.2,
            label: 'vs last period',
            positive: true,
          }}
        />
        <StatsCard
          title="Average Amount"
          value={`$${stats.averageAmount.toFixed(2)}`}
        />
        <StatsCard
          title="Conversion Rate"
          value={`${conversionData.rate.toFixed(1)}%`}
          description={`${conversionData.completed} of ${conversionData.total} completed`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense
            fallback={
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            }
          >
            <PaymentChart data={timeSeriesData} />
          </Suspense>
        </div>
        <div>
          <Suspense
            fallback={
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            }
          >
            <CurrencyDistribution data={currencyData} />
          </Suspense>
        </div>
      </div>

      {/* Analytics Overview */}
      <Suspense fallback={<div>Loading analytics...</div>}>
        <PaymentAnalytics />
      </Suspense>

      {/* Recent Payments */}
      <Suspense fallback={<div>Loading payments...</div>}>
        <RecentPayments />
      </Suspense>

      {/* Refund Requests */}
      <Suspense fallback={<div>Loading refunds...</div>}>
        <RefundRequests />
      </Suspense>

      {/* Disputes */}
      <Suspense fallback={<div>Loading disputes...</div>}>
        <DisputesList />
      </Suspense>
    </div>
  );
}
