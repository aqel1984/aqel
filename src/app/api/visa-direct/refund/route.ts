import { NextRequest, NextResponse } from 'next/server';
import { visaRefundService } from '@/lib/services/visa-refund';
import { validateToken } from '@/lib/auth/token';
import { rateLimitMiddleware } from '@/lib/middleware/rate-limit';

const rateLimitConfig = {
  maxRequests: 10,
  windowInSeconds: 60,
  identifier: 'VISA_REFUND_API'
};

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitMiddleware(req, rateLimitConfig);
    if (rateLimitResult) return rateLimitResult;

    // Validate authentication
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await validateToken(token);
    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    const {
      transactionId,
      amount,
      currency,
      reason,
      merchantId,
      customerEmail
    } = body;

    // Validate required fields
    if (!transactionId || !amount || !currency || !reason || !merchantId || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Process refund
    const refund = await visaRefundService.initiateRefund({
      transactionId,
      amount,
      currency,
      reason,
      merchantId,
      customerEmail
    });

    return NextResponse.json(refund);
  } catch (error: any) {
    console.error('Error processing Visa refund:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitMiddleware(req, {
      maxRequests: 50,
      windowInSeconds: 60,
      identifier: 'VISA_REFUND_STATUS_API'
    });
    if (rateLimitResult) return rateLimitResult;

    // Validate authentication
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await validateToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get transaction ID from query params
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      // If no transaction ID provided, return list of pending refunds (admin only)
      if (!user.isAdmin) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
      const pendingRefunds = await visaRefundService.listPendingRefunds();
      return NextResponse.json(pendingRefunds);
    }

    // Get refund status for specific transaction
    const refund = await visaRefundService.getRefundStatus(transactionId);
    
    if (!refund) {
      return NextResponse.json(
        { error: 'Refund not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this refund
    if (!user.isAdmin && refund.customerEmail !== user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(refund);
  } catch (error: any) {
    console.error('Error getting refund status:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    );
  }
}
