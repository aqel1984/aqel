import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/middleware/auth';
import { rateLimitMiddleware } from '@/lib/middleware/rate-limit';
import { 
  createRefund,
  getPaymentRefunds
} from '@/lib/services/payment-tracking';

async function handleGetRefunds(request: NextRequest): Promise<NextResponse> {
  // Apply rate limiting
  const rateLimitResult = await rateLimitMiddleware(request);
  if (rateLimitResult) return rateLimitResult;

  try {
    const searchParams = new URL(request.url).searchParams;
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const refunds = await getPaymentRefunds(paymentId);
    return NextResponse.json({
      success: true,
      refunds,
    });
  } catch (error) {
    console.error('Failed to get refunds:', error);
    return NextResponse.json(
      { error: 'Failed to get refunds' },
      { status: 500 }
    );
  }
}

async function handleCreateRefund(request: NextRequest): Promise<NextResponse> {
  // Apply rate limiting
  const rateLimitResult = await rateLimitMiddleware(request);
  if (rateLimitResult) return rateLimitResult;

  try {
    const body = await request.json();
    const { paymentId, amount, currency, reason } = body;

    // Validate request body
    if (!paymentId || !amount || !currency || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create refund
    const refund = await createRefund({
      id: crypto.randomUUID(),
      paymentId,
      amount,
      currency,
      reason,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      refund,
    });
  } catch (error) {
    console.error('Failed to create refund:', error);
    return NextResponse.json(
      { error: 'Failed to create refund' },
      { status: 500 }
    );
  }
}

export const GET = withRole(['refund:read'])(handleGetRefunds);
export const POST = withRole(['refund:write'])(handleCreateRefund);
