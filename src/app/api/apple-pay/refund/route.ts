import { NextResponse } from 'next/server';
import { authMiddleware, type AuthenticatedUser } from '@/middleware/auth';
import { rateLimitMiddleware } from '@/lib/middleware/rate-limit';
import { ApplePayRefundService } from '@/lib/services/apple-pay-refund';
import { logger } from '@/lib/logger';
import type { MiddlewareRequest } from '@/lib/types/middleware';

const log = logger('apple-pay-refund');
const applePayRefundService = new ApplePayRefundService();

// Shared rate limit config for refund endpoints
const rateLimitConfig = {
  maxRequests: 10,
  windowMs: 3600 * 1000, // 1 hour in milliseconds
  includeMethod: true, // Rate limit POST and PUT separately
  skipPaths: ['/api/health', '/api/status'] // Example paths to skip
};

export async function POST(request: MiddlewareRequest): Promise<NextResponse> {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(request, rateLimitConfig);
    if (rateLimitResult.status === 429) return rateLimitResult;

    // Apply authentication
    return await authMiddleware(request, async (_: MiddlewareRequest, user: AuthenticatedUser) => {
      try {
        const body = await request.json();
        
        // Validate request body
        if (!body.transactionId || !body.amount || typeof body.amount !== 'number') {
          return NextResponse.json(
            { error: 'Missing required fields: transactionId and amount (must be a number)' },
            { status: 400 }
          );
        }

        // Process refund
        const result = await applePayRefundService.processRefund(
          body.transactionId,
          body.amount
        );

        return NextResponse.json(result);
      } catch (error) {
        log.error('Failed to process Apple Pay refund', {
          error: error instanceof Error ? error.message : 'Unknown error',
          user: user.id
        });

        return NextResponse.json(
          { error: 'Failed to process refund' },
          { status: 500 }
        );
      }
    });
  } catch (error) {
    log.error('Unexpected error in Apple Pay refund endpoint', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: MiddlewareRequest): Promise<NextResponse> {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(request, rateLimitConfig);
    if (rateLimitResult.status === 429) return rateLimitResult;

    // Apply authentication
    return await authMiddleware(request, async (_: MiddlewareRequest, user: AuthenticatedUser) => {
      try {
        const body = await request.json();
        
        // Validate request body
        if (!body.refundId || !body.status) {
          return NextResponse.json(
            { error: 'Missing required fields: refundId and status' },
            { status: 400 }
          );
        }

        // Update refund status
        const result = await applePayRefundService.updateRefundStatus(
          body.refundId,
          body.status
        );

        return NextResponse.json(result);
      } catch (error) {
        log.error('Failed to update Apple Pay refund status', {
          error: error instanceof Error ? error.message : 'Unknown error',
          user: user.id
        });

        return NextResponse.json(
          { error: 'Failed to update refund status' },
          { status: 500 }
        );
      }
    });
  } catch (error) {
    log.error('Unexpected error in Apple Pay refund update endpoint', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
