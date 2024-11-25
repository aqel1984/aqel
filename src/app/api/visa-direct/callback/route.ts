import { NextRequest, NextResponse } from 'next/server';
import { verifyVisaWebhookSignature } from '@/lib/services/visa-payment';
import { redis } from '@/lib/redis';
import baseLogger from '@/lib/logger';

const logger = baseLogger.child({ context: 'visa-direct-callback' });

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signature = req.headers.get('x-visa-signature');

    if (!signature) {
      logger.error('Visa webhook signature missing');
      return NextResponse.json(
        { error: 'Signature missing' },
        { status: 401 }
      );
    }

    // Verify the webhook signature
    const isValid = await verifyVisaWebhookSignature(signature, JSON.stringify(body));
    if (!isValid) {
      logger.error('Invalid Visa webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Extract transaction details
    const { transactionId, status, amount, currency } = body;
    
    // Store transaction status in Redis
    const redisKey = `visa:transaction:${transactionId}`;
    await redis.hset(redisKey, {
      status,
      amount,
      currency,
      updatedAt: new Date().toISOString(),
    });

    // Set expiry for Redis key (30 days)
    await redis.expire(redisKey, 60 * 60 * 24 * 30);

    logger.info(`Visa callback processed for transaction ${transactionId}`, {
      status,
      amount,
      currency,
    });

    return NextResponse.json(
      { message: 'Webhook processed successfully' },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error processing Visa webhook', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
