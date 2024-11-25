import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRecentPayments } from '@/lib/services/payment-tracking';
import { authMiddleware } from '@/middleware/auth';
import { rateLimitMiddleware } from '@/lib/middleware/rate-limit';

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimitMiddleware(request, {
    maxRequests: 100,
    windowInSeconds: 3600,
    identifier: 'payment-analytics'
  });
  if (rateLimitResult) return rateLimitResult;

  // Apply authentication
  return authMiddleware(request, async (_, user) => {
    try {
      // Check if user has required permissions
      if (!user.roles.includes('analytics:read')) {
        return NextResponse.json(
          { error: 'Unauthorized - Insufficient permissions' },
          { status: 403 }
        );
      }

      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get('limit') || '50');

      const payments = await getRecentPayments(limit);

      // Calculate analytics
      const analytics = {
        totalPayments: payments.length,
        successfulPayments: payments.filter(p => p.status === 'completed').length,
        failedPayments: payments.filter(p => p.status === 'failed').length,
        pendingPayments: payments.filter(p => p.status === 'pending').length,
        totalAmount: payments
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0),
        averageAmount: payments.length > 0 
          ? payments
              .filter(p => p.status === 'completed')
              .reduce((sum, p) => sum + p.amount, 0) / 
              payments.filter(p => p.status === 'completed').length
          : 0,
        paymentMethods: payments.reduce((acc, p) => {
          acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        successRate: payments.length > 0
          ? (payments.filter(p => p.status === 'completed').length / payments.length) * 100
          : 0
      };

      return NextResponse.json({
        success: true,
        analytics,
        recentPayments: payments
      });

    } catch (error) {
      console.error('Failed to get payment analytics:', error);
      return NextResponse.json(
        { 
          error: 'Failed to get payment analytics',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  });
}
