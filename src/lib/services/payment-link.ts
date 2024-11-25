import { nanoid } from 'nanoid';
import { redis } from '@/lib/redis';
import { z } from 'zod';

const PAYMENT_LINK_PREFIX = 'payment_link:';
const PAYMENT_LINK_TTL = 60 * 60 * 24 * 7; // 7 days

export const PaymentLinkSchema = z.object({
  id: z.string(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  createdBy: z.string(),
  status: z.enum(['active', 'expired', 'completed', 'cancelled']),
  paymentId: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
});

export type PaymentLink = z.infer<typeof PaymentLinkSchema>;

export interface CreatePaymentLinkOptions {
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
  createdBy: string;
  expiresIn?: number; // seconds
}

/**
 * Creates a new payment link
 */
export async function createPaymentLink(
  options: CreatePaymentLinkOptions
): Promise<PaymentLink> {
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + (options.expiresIn || PAYMENT_LINK_TTL) * 1000
  );

  const paymentLink: PaymentLink = {
    id: nanoid(10),
    amount: options.amount,
    currency: options.currency,
    description: options.description,
    metadata: options.metadata,
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
    createdBy: options.createdBy,
    status: 'active',
  };

  // Store in Redis
  await redis.set(
    `${PAYMENT_LINK_PREFIX}${paymentLink.id}`,
    JSON.stringify(paymentLink),
    {
      ex: options.expiresIn || PAYMENT_LINK_TTL
    }
  );

  return paymentLink;
}

/**
 * Gets a payment link by ID
 */
export async function getPaymentLink(id: string): Promise<PaymentLink | null> {
  const data = await redis.get<string>(`${PAYMENT_LINK_PREFIX}${id}`);
  if (!data) return null;

  const paymentLink = PaymentLinkSchema.parse(JSON.parse(data));
  
  // Check if expired
  if (new Date(paymentLink.expiresAt) < new Date()) {
    paymentLink.status = 'expired';
    await updatePaymentLink(id, paymentLink);
  }

  return paymentLink;
}

/**
 * Updates a payment link
 */
export async function updatePaymentLink(
  id: string,
  updates: Partial<PaymentLink>
): Promise<PaymentLink | null> {
  const paymentLink = await getPaymentLink(id);
  if (!paymentLink) return null;

  const updatedLink = {
    ...paymentLink,
    ...updates,
  };

  // Calculate remaining TTL
  const expiresAt = new Date(updatedLink.expiresAt);
  const ttl = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));

  // Store updated link
  await redis.set(
    `${PAYMENT_LINK_PREFIX}${id}`,
    JSON.stringify(updatedLink),
    {
      ex: ttl
    }
  );

  return updatedLink;
}

/**
 * Lists all active payment links for a user
 */
export async function listPaymentLinks(
  createdBy: string,
  status?: PaymentLink['status']
): Promise<PaymentLink[]> {
  const keys = await redis.keys(`${PAYMENT_LINK_PREFIX}*`);
  const links: PaymentLink[] = [];

  for (const key of keys) {
    const data = await redis.get<string>(key);
    if (!data) continue;

    const link = PaymentLinkSchema.parse(JSON.parse(data));
    
    // Check if expired
    if (new Date(link.expiresAt) < new Date()) {
      link.status = 'expired';
      await updatePaymentLink(link.id, link);
    }

    if (link.createdBy === createdBy && (!status || link.status === status)) {
      links.push(link);
    }
  }

  return links.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Cancels a payment link
 */
export async function cancelPaymentLink(id: string): Promise<PaymentLink | null> {
  return updatePaymentLink(id, { status: 'cancelled' });
}

/**
 * Completes a payment link
 */
export async function completePaymentLink(
  id: string,
  paymentId: string,
  customerEmail?: string,
  customerName?: string
): Promise<PaymentLink | null> {
  return updatePaymentLink(id, {
    status: 'completed',
    paymentId,
    customerEmail,
    customerName,
  });
}
