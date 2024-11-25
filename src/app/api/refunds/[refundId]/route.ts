import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/middleware/auth';
import { rateLimitMiddleware } from '@/lib/middleware/rate-limit';
import { getRefund } from '@/lib/services/payment-tracking';

async function handleGetRefund(request: NextRequest): Promise<NextResponse> {
  // Apply rate limiting
  const rateLimitResult = await rateLimitMiddleware(request);
  if (rateLimitResult) return rateLimitResult;

  try {
    // Extract refundId from URL
    const refundId = request.nextUrl.pathname.split('/').pop();
    if (!refundId) {
      return NextResponse.json(
        { error: 'Refund ID is required' },
        { status: 400 }
      );
    }

    const refund = await getRefund(refundId);
    if (!refund) {
      return NextResponse.json(
        { error: 'Refund not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason,
        createdAt: refund.createdAt,
      },
    });
  } catch (error) {
    console.error('Failed to get refund:', error);
    return NextResponse.json(
      { error: 'Failed to get refund' },
      { status: 500 }
    );
  }
}

export const GET = withRole(['refund:read'])(handleGetRefund);
