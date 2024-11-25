import { getPaymentById } from './payment-tracking';
import { listPaymentLinks } from './payment-link';

interface PaymentStats {
  totalAmount: number;
  totalCount: number;
  successRate: number;
  averageAmount: number;
  byCurrency: Record<string, {
    amount: number;
    count: number;
  }>;
  byStatus: Record<string, number>;
}

export interface TimeSeriesData {
  timestamp: string;
  amount: number;
  count: number;
}

/**
 * Get payment statistics for a given time period
 */
export async function getPaymentStats(
  startDate: Date,
  endDate: Date
): Promise<PaymentStats> {
  const links = await listPaymentLinks('admin');
  const stats: PaymentStats = {
    totalAmount: 0,
    totalCount: 0,
    successRate: 0,
    averageAmount: 0,
    byCurrency: {},
    byStatus: {},
  };

  let successCount = 0;

  for (const link of links) {
    if (!link.paymentId) continue;
    
    const payment = await getPaymentById(link.paymentId);
    if (!payment) continue;

    const paymentDate = new Date(payment.createdAt);
    if (paymentDate < startDate || paymentDate > endDate) continue;

    // Update total stats
    stats.totalCount++;
    stats.totalAmount += payment.amount;

    // Update currency stats
    const currencyStats = stats.byCurrency[payment.currency] || { amount: 0, count: 0 };
    stats.byCurrency[payment.currency] = currencyStats;
    currencyStats.amount += payment.amount;
    currencyStats.count++;

    // Update status stats
    const currentStatusCount = stats.byStatus[payment.status] || 0;
    stats.byStatus[payment.status] = currentStatusCount + 1;

    if (payment.status === 'completed') {
      successCount++;
    }
  }

  // Calculate averages and rates
  stats.successRate = stats.totalCount > 0 
    ? (successCount / stats.totalCount) * 100 
    : 0;
  stats.averageAmount = stats.totalCount > 0 
    ? stats.totalAmount / stats.totalCount 
    : 0;

  return stats;
}

/**
 * Get time series data for payments
 */
export async function getPaymentTimeSeries(
  startDate: Date,
  endDate: Date,
  interval: 'hour' | 'day' | 'week' | 'month' = 'day'
): Promise<TimeSeriesData[]> {
  const links = await listPaymentLinks('admin');
  const timeSeriesMap = new Map<string, TimeSeriesData>();

  // Create time slots
  const current = new Date(startDate);
  while (current <= endDate) {
    const key = getTimeKey(current, interval);
    timeSeriesMap.set(key, {
      timestamp: key,
      amount: 0,
      count: 0,
    });
    
    // Increment by interval
    switch (interval) {
      case 'hour':
        current.setHours(current.getHours() + 1);
        break;
      case 'day':
        current.setDate(current.getDate() + 1);
        break;
      case 'week':
        current.setDate(current.getDate() + 7);
        break;
      case 'month':
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }

  // Aggregate payment data
  for (const link of links) {
    if (!link.paymentId) continue;
    
    const payment = await getPaymentById(link.paymentId);
    if (!payment || payment.status !== 'completed') continue;

    const paymentDate = new Date(payment.createdAt);
    if (paymentDate < startDate || paymentDate > endDate) continue;

    const key = getTimeKey(paymentDate, interval);
    const data = timeSeriesMap.get(key);
    if (data) {
      data.amount += payment.amount;
      data.count++;
    }
  }

  return Array.from(timeSeriesMap.values());
}

/**
 * Get currency distribution data
 */
export async function getCurrencyDistribution(
  startDate: Date,
  endDate: Date
): Promise<Record<string, { amount: number; percentage: number }>> {
  const stats = await getPaymentStats(startDate, endDate);
  const distribution: Record<string, { amount: number; percentage: number }> = {};
  
  const totalAmount = Object.values(stats.byCurrency)
    .reduce((sum, curr) => sum + curr.amount, 0);

  for (const [currency, data] of Object.entries(stats.byCurrency)) {
    distribution[currency] = {
      amount: data.amount,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
    };
  }

  return distribution;
}

/**
 * Get conversion rate data
 */
export async function getConversionRate(
  startDate: Date,
  endDate: Date
): Promise<{
  rate: number;
  total: number;
  completed: number;
}> {
  const links = await listPaymentLinks('admin');
  let total = 0;
  let completed = 0;

  for (const link of links) {
    const createdAt = new Date(link.createdAt);
    if (createdAt < startDate || createdAt > endDate) continue;

    total++;
    if (link.status === 'completed') {
      completed++;
    }
  }

  return {
    rate: total > 0 ? (completed / total) * 100 : 0,
    total,
    completed,
  };
}

// Helper function to generate time series keys
function getTimeKey(date: Date, interval: 'hour' | 'day' | 'week' | 'month'): string {
  switch (interval) {
    case 'hour':
      return date.toISOString().slice(0, 13) + ':00:00.000Z';
    case 'day':
      return date.toISOString().slice(0, 10) + 'T00:00:00.000Z';
    case 'week':
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return weekStart.toISOString().slice(0, 10) + 'T00:00:00.000Z';
    case 'month':
      return date.toISOString().slice(0, 7) + '-01T00:00:00.000Z';
  }
}
