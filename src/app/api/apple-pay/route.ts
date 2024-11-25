import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ApplePayService } from '@/lib/services/apple-pay';
import { authMiddleware } from '@/middleware/auth';
import { rateLimitMiddleware } from '@/lib/middleware/rate-limit';
import { trackPayment } from '@/lib/services/payment-tracking';
import { sendAlert, isHighValuePayment, trackFailedPayment } from '@/lib/services/notification';
import type { MiddlewareRequest } from '@/lib/types/middleware';

const applePayService = new ApplePayService();

// Shared rate limit config for Apple Pay endpoints
const rateLimitConfig = {
  maxRequests: 20,
  windowMs: 3600 * 1000, // 1 hour in milliseconds
  includeMethod: true,
  skipPaths: ['/api/health', '/api/status']
};

export async function POST(request: NextRequest) {
  // Convert NextRequest to MiddlewareRequest
  const middlewareRequest: MiddlewareRequest = {
    ...request,
    ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  };

  // Apply rate limiting
  const rateLimitResult = await rateLimitMiddleware(middlewareRequest, rateLimitConfig);
  if (rateLimitResult.status === 429) return rateLimitResult;

  // Apply authentication
  return authMiddleware(middlewareRequest, async (req, user) => {
    try {
      // Check if user has required permissions
      if (!user.roles.includes('payment:write')) {
        return NextResponse.json(
          { error: 'Unauthorized - Insufficient permissions' },
          { status: 403 }
        );
      }

      const { amount, validationURL, invoiceNumber } = await req.json();

      if (!amount || !validationURL || !invoiceNumber) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Track payment initiation
      await trackPayment(invoiceNumber, {
        amount: Number(amount),
        currency: 'USD',
        customerEmail: user.email,
        customerName: user.name,
        paymentMethod: 'apple_pay',
        metadata: {
          status: 'pending',
          timestamp: new Date().toISOString()
        }
      });

      // Validate merchant with Apple Pay
      const validationData = await applePayService.validateMerchant(validationURL);

      // Check if this is a high-value payment
      if (isHighValuePayment(amount)) {
        await sendAlert('high-value-payment', {
          amount,
          invoiceNumber,
          customerEmail: user.email
        });
      }

      return NextResponse.json(validationData);
    } catch (error) {
      console.error('Apple Pay error:', error);

      // Track failed payment
      if (error instanceof Error) {
        await trackFailedPayment(error.message);
      }

      return NextResponse.json(
        { error: 'Failed to process Apple Pay request' },
        { status: 500 }
      );
    }
  });
}

export async function PUT(request: NextRequest) {
  // Convert NextRequest to MiddlewareRequest
  const middlewareRequest: MiddlewareRequest = {
    ...request,
    ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  };

  // Apply rate limiting
  const rateLimitResult = await rateLimitMiddleware(middlewareRequest, rateLimitConfig);
  if (rateLimitResult.status === 429) return rateLimitResult;

  // Apply authentication
  return authMiddleware(middlewareRequest, async (req, user) => {
    try {
      // Check if user has required permissions
      if (!user.roles.includes('payment:write')) {
        return NextResponse.json(
          { error: 'Unauthorized - Insufficient permissions' },
          { status: 403 }
        );
      }

      const { paymentId, status } = await req.json();

      if (!paymentId || !status) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Update payment status
      const updatedPayment = await applePayService.updatePaymentStatus(paymentId, status);

      // Send notification for failed payments
      if (status === 'failed') {
        await sendAlert('payment-failed', {
          paymentId,
          customerEmail: user.email
        });
      }

      return NextResponse.json(updatedPayment);
    } catch (error) {
      console.error('Apple Pay update error:', error);
      return NextResponse.json(
        { error: 'Failed to update payment status' },
        { status: 500 }
      );
    }
  });
}
