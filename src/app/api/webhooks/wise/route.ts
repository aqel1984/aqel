import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { z } from 'zod';
import { Redis } from '@upstash/redis';
import { logger } from '@/lib/utils/logger';
import { updatePaymentStatus } from '@/lib/services/payment-tracking';
import { 
  WiseConfig, 
  WiseWebhookEvents, 
  WiseStateMap 
} from '@/lib/config/wise';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL || '',
  token: process.env.UPSTASH_REDIS_TOKEN || '',
});

// Wise webhook event schema
const WiseWebhookSchema = z.object({
  data: z.object({
    resource: z.object({
      id: z.number(),
      type: z.string(),
      profile_id: z.number(),
      state: z.string(),
      status: z.string(),
      amount: z.number(),
      source_currency: z.string(),
      target_currency: z.string(),
      created_at: z.string(),
      updated_at: z.string(),
    }),
    current_state: z.string(),
    previous_state: z.string().optional(),
    occurred_at: z.string(),
  }),
  subscription_id: z.string(),
  event_type: z.enum([
    WiseWebhookEvents.TRANSFER_STATE_CHANGE,
    WiseWebhookEvents.BALANCE_DEPOSIT,
    WiseWebhookEvents.TRANSFER_ISSUE,
  ]),
});

// Verify Wise webhook signature
function verifyWiseSignature(payload: string, signature: string): boolean {
  try {
    const publicKey = WiseConfig.webhookPublicKey;
    if (!publicKey) {
      logger.error('WISE_WEBHOOK_PUBLIC_KEY not configured');
      return false;
    }

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(payload);
    return verifier.verify(publicKey, signature, 'base64');
  } catch (error) {
    logger.error('Failed to verify Wise signature:', error);
    return false;
  }
}

// Process transfer state change
async function handleTransferStateChange(data: z.infer<typeof WiseWebhookSchema>['data']) {
  const { resource, current_state } = data;
  
  try {
    const paymentStatus = WiseStateMap[current_state];
    if (!paymentStatus) {
      logger.warn('Unknown Wise transfer state:', current_state);
      return;
    }

    // Update payment status in our system
    await updatePaymentStatus(resource.id.toString(), paymentStatus);

    // Store event in Redis for audit trail
    await redis.hset(
      `wise:transfers:${resource.id}:events`,
      {
        [data.occurred_at]: JSON.stringify(data)
      }
    );

    // If payment is completed, trigger any necessary callbacks or notifications
    if (current_state === 'COMPLETED') {
      await redis.publish('payment:completed', JSON.stringify({
        transferId: resource.id,
        amount: resource.amount,
        currency: resource.target_currency,
        timestamp: data.occurred_at
      }));
    }

    // If payment failed, trigger failure handling
    if (current_state === 'FAILED' || current_state === 'CANCELLED') {
      await redis.publish('payment:failed', JSON.stringify({
        transferId: resource.id,
        reason: current_state,
        timestamp: data.occurred_at
      }));
    }

    logger.info('Successfully processed transfer state change', {
      transferId: resource.id,
      state: current_state,
      paymentStatus,
    });
  } catch (error) {
    logger.error('Failed to process transfer state change:', error);
    throw error;
  }
}

// Process balance deposit
async function handleBalanceDeposit(data: z.infer<typeof WiseWebhookSchema>['data']) {
  try {
    // Store balance deposit event
    await redis.hset(
      'wise:balance:deposits',
      {
        [data.occurred_at]: JSON.stringify(data)
      }
    );

    logger.info('Successfully processed balance deposit', {
      amount: data.resource.amount,
      currency: data.resource.target_currency,
      profileId: data.resource.profile_id,
    });
  } catch (error) {
    logger.error('Failed to process balance deposit:', error);
    throw error;
  }
}

// Process transfer issue
async function handleTransferIssue(data: z.infer<typeof WiseWebhookSchema>['data']) {
  try {
    // Store transfer issue event
    await redis.hset(
      `wise:transfers:${data.resource.id}:issues`,
      {
        [data.occurred_at]: JSON.stringify(data)
      }
    );

    // Update payment status to reflect issue
    await updatePaymentStatus(data.resource.id.toString(), 'failed');

    logger.info('Successfully processed transfer issue', {
      transferId: data.resource.id,
      state: data.current_state,
      profileId: data.resource.profile_id,
    });
  } catch (error) {
    logger.error('Failed to process transfer issue:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the raw request body for signature verification
    const rawBody = await request.text();
    
    // Verify Wise signature
    const signature = headers().get('x-signature-sha256');
    if (!signature || !verifyWiseSignature(rawBody, signature)) {
      logger.warn('Invalid Wise webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse and validate webhook payload
    const payload = WiseWebhookSchema.parse(JSON.parse(rawBody));

    // Process different event types
    switch (payload.event_type) {
      case WiseWebhookEvents.TRANSFER_STATE_CHANGE:
        await handleTransferStateChange(payload.data);
        break;
      case WiseWebhookEvents.BALANCE_DEPOSIT:
        await handleBalanceDeposit(payload.data);
        break;
      case WiseWebhookEvents.TRANSFER_ISSUE:
        await handleTransferIssue(payload.data);
        break;
      default:
        logger.warn('Unhandled Wise webhook event type:', payload.event_type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Invalid webhook payload:', error.errors);
      return NextResponse.json(
        { error: 'Invalid payload format' },
        { status: 400 }
      );
    }

    logger.error('Failed to process Wise webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
