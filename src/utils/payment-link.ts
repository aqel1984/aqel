import { z } from 'zod';
import { nanoid } from 'nanoid';
import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';

const log = logger('payment-link');

export const paymentLinkSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().min(1, 'Currency is required'),
  description: z.string().min(1, 'Description is required'),
  recipientEmail: z.string().email('Valid email is required'),
  expiresIn: z.number().optional().default(24 * 60 * 60), // 24 hours in seconds
});

export type PaymentLinkData = z.infer<typeof paymentLinkSchema>;

export async function generatePaymentLink(data: PaymentLinkData): Promise<string> {
  try {
    const id = nanoid(10);
    const paymentData = {
      ...data,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    // Store payment data in Redis with expiration
    await redis.set(
      `payment_link:${id}`,
      JSON.stringify(paymentData),
      'EX',
      data.expiresIn
    );

    // Generate the full payment URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const paymentUrl = `${baseUrl}/pay/${id}`;

    log.info('Generated payment link', { id, amount: data.amount, currency: data.currency });
    return paymentUrl;
  } catch (error: any) {
    log.error('Failed to generate payment link', error);
    throw new Error('Failed to generate payment link');
  }
}

export async function getPaymentLinkData(linkId: string) {
  try {
    const data = await redis.get(`payment_link:${linkId}`);
    if (!data) return null;

    return JSON.parse(data);
  } catch (error: any) {
    log.error('Failed to get payment link data', error);
    return null;
  }
}
