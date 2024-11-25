import { Payment, getPaymentById } from './payment-tracking';
import { listPaymentLinks } from './payment-link';
import { redis } from '@/lib/redis';

export interface PaymentReport {
  totalAmount: number;
  successfulPayments: number;
  failedPayments: number;
  averageAmount: number;
  conversionRate: number;
  currencyBreakdown: Record<string, {
    amount: number;
    count: number;
  }>;
  timeline: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
}

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  currency?: string;
  status?: Payment['status'];
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Generates a detailed payment report based on filters
 */
export async function generatePaymentReport(filters: ReportFilters): Promise<PaymentReport> {
  const links = await listPaymentLinks('admin');
  const report: PaymentReport = {
    totalAmount: 0,
    successfulPayments: 0,
    failedPayments: 0,
    averageAmount: 0,
    conversionRate: 0,
    currencyBreakdown: {},
    timeline: [],
  };

  const timelineMap = new Map<string, { amount: number; count: number }>();
  let totalLinks = 0;

  for (const link of links) {
    const paymentDate = new Date(link.createdAt);
    if (paymentDate < filters.startDate || paymentDate > filters.endDate) continue;

    totalLinks++;
    if (!link.paymentId) continue;

    const payment = await getPaymentById(link.paymentId);
    if (!payment) continue;

    // Apply filters
    if (filters.currency && payment.currency !== filters.currency) continue;
    if (filters.status && payment.status !== filters.status) continue;
    if (filters.minAmount && payment.amount < filters.minAmount) continue;
    if (filters.maxAmount && payment.amount > filters.maxAmount) continue;

    // Update totals
    report.totalAmount += payment.amount;
    if (payment.status === 'completed') {
      report.successfulPayments++;
    } else if (payment.status === 'failed') {
      report.failedPayments++;
    }

    // Update currency breakdown
    const currency = payment.currency;
    if (!report.currencyBreakdown[currency]) {
      report.currencyBreakdown[currency] = { amount: 0, count: 0 };
    }
    report.currencyBreakdown[currency].amount += payment.amount;
    report.currencyBreakdown[currency].count++;

    // Update timeline
    const dateKey = paymentDate.toISOString().split('T')[0] || '';
    if (!dateKey) continue;
    
    if (!timelineMap.has(dateKey)) {
      timelineMap.set(dateKey, { amount: 0, count: 0 });
    }
    const timelineData = timelineMap.get(dateKey)!;
    timelineData.amount += payment.amount;
    timelineData.count++;
  }

  // Calculate averages and rates
  const totalPayments = report.successfulPayments + report.failedPayments;
  report.averageAmount = totalPayments > 0 ? report.totalAmount / totalPayments : 0;
  report.conversionRate = totalLinks > 0 ? (report.successfulPayments / totalLinks) * 100 : 0;

  // Sort timeline
  report.timeline = Array.from(timelineMap.entries())
    .map(([date, data]) => ({
      date,
      amount: data.amount,
      count: data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return report;
}

/**
 * Generates a CSV report of payments
 */
export async function generatePaymentCSV(filters: ReportFilters): Promise<string> {
  const links = await listPaymentLinks('admin');
  const rows: string[] = ['Date,Amount,Currency,Status,Customer Email,Customer Name'];

  for (const link of links) {
    if (!link.paymentId) continue;
    
    const payment = await getPaymentById(link.paymentId);
    if (!payment) continue;

    const paymentDate = new Date(payment.createdAt);
    if (paymentDate < filters.startDate || paymentDate > filters.endDate) continue;

    // Apply filters
    if (filters.currency && payment.currency !== filters.currency) continue;
    if (filters.status && payment.status !== filters.status) continue;
    if (filters.minAmount && payment.amount < filters.minAmount) continue;
    if (filters.maxAmount && payment.amount > filters.maxAmount) continue;

    rows.push(
      [
        payment.createdAt,
        payment.amount,
        payment.currency,
        payment.status,
        payment.customerEmail || '',
        payment.customerName || '',
      ].join(',')
    );
  }

  return rows.join('\n');
}

/**
 * Saves a report for future reference
 */
export async function saveReport(report: PaymentReport, name: string): Promise<void> {
  const key = `report:${name}:${Date.now()}`;
  await redis.set(key, JSON.stringify(report));
  await redis.expire(key, 60 * 60 * 24 * 30); // 30 days
}

/**
 * Gets a saved report by name
 */
export async function getReport(name: string): Promise<PaymentReport | null> {
  const data = await redis.get<string>(`report:${name}`);
  if (!data) return null;

  return JSON.parse(data) as PaymentReport;
}

/**
 * Gets payment volume by hour
 */
export async function getHourlyVolume(date: Date): Promise<Array<{
  hour: number;
  amount: number;
  count: number;
}>> {
  const hourlyData = new Map<number, { amount: number; count: number }>();
  
  // Initialize all hours
  for (let i = 0; i < 24; i++) {
    hourlyData.set(i, { amount: 0, count: 0 });
  }

  const links = await listPaymentLinks('admin');
  for (const link of links) {
    if (!link.paymentId) continue;

    const payment = await getPaymentById(link.paymentId);
    if (!payment) continue;

    const paymentDate = new Date(link.createdAt);
    if (paymentDate.toDateString() !== date.toDateString()) continue;

    const hour = paymentDate.getHours();
    const data = hourlyData.get(hour)!;
    data.amount += payment.amount;
    data.count++;
  }

  return Array.from(hourlyData.entries()).map(([hour, data]) => ({
    hour,
    amount: data.amount,
    count: data.count,
  }));
}
