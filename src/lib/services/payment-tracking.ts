import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL || '',
  token: process.env.UPSTASH_REDIS_TOKEN || '',
});

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  customerEmail: string;
  customerName: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export async function getPaymentById(id: string): Promise<Payment | null> {
  try {
    const payment = await redis.hget<string>('payments', id);
    return payment ? JSON.parse(payment) as Payment : null;
  } catch (error) {
    console.error('Failed to get payment:', error);
    return null;
  }
}

export async function createPayment(payment: Omit<Payment, 'createdAt' | 'updatedAt'>): Promise<Payment> {
  const now = new Date().toISOString();
  const newPayment: Payment = {
    ...payment,
    createdAt: now,
    updatedAt: now,
  };

  await redis.hset('payments', {
    [payment.id]: JSON.stringify(newPayment)
  });
  return newPayment;
}

export async function updatePaymentStatus(
  id: string,
  status: Payment['status']
): Promise<Payment | null> {
  const payment = await getPaymentById(id);
  if (!payment) return null;

  const updatedPayment: Payment = {
    ...payment,
    status,
    updatedAt: new Date().toISOString(),
  };

  await redis.hset('payments', {
    [id]: JSON.stringify(updatedPayment)
  });
  return updatedPayment;
}

export async function getRecentPayments(limit: number = 50): Promise<Payment[]> {
  const payments = await redis.hgetall<Record<string, string>>('payments');
  if (!payments) return [];

  return Object.values(payments)
    .map(str => JSON.parse(str) as Payment)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export async function trackPayment(
  id: string,
  data: {
    amount: number;
    currency: string;
    customerEmail: string;
    customerName: string;
    paymentMethod: string;
    metadata?: Record<string, any>;
  }
): Promise<Payment> {
  const payment = await createPayment({
    id,
    status: 'pending',
    ...data,
  });

  // Log payment tracking event
  console.info('Payment tracked:', {
    id,
    amount: data.amount,
    currency: data.currency,
    customerEmail: data.customerEmail,
    paymentMethod: data.paymentMethod,
  });

  return payment;
}

export async function getRefund(id: string): Promise<Refund | null> {
  try {
    const refund = await redis.hget<string>('refunds', id);
    return refund ? JSON.parse(refund) as Refund : null;
  } catch (error) {
    console.error('Failed to get refund:', error);
    return null;
  }
}

export async function createRefund(refund: Omit<Refund, 'createdAt' | 'updatedAt'>): Promise<Refund> {
  const now = new Date().toISOString();
  const newRefund: Refund = {
    ...refund,
    createdAt: now,
    updatedAt: now,
  };

  await redis.hset('refunds', {
    [refund.id]: JSON.stringify(newRefund)
  });

  // Update payment status
  await updatePaymentStatus(refund.paymentId, 'refunded');

  return newRefund;
}

export async function updateRefundStatus(
  id: string,
  status: Refund['status']
): Promise<Refund | null> {
  const refund = await getRefund(id);
  if (!refund) return null;

  const updatedRefund: Refund = {
    ...refund,
    status,
    updatedAt: new Date().toISOString(),
  };

  await redis.hset('refunds', {
    [id]: JSON.stringify(updatedRefund)
  });
  return updatedRefund;
}

export async function getPaymentRefunds(paymentId: string): Promise<Refund[]> {
  const refunds = await redis.hgetall<Record<string, string>>('refunds');
  if (!refunds) return [];

  return Object.values(refunds)
    .map(str => JSON.parse(str) as Refund)
    .filter(refund => refund.paymentId === paymentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
