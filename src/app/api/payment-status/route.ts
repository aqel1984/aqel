import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPaymentById } from '@/lib/services/payment-tracking';
import { authMiddleware } from '@/middleware/auth';

export async function GET(request: NextRequest) {
  return authMiddleware(request, async (_, user) => {
    try {
      if (!user.roles.includes('payment:read')) {
        return NextResponse.json(
          { error: 'Unauthorized - Insufficient permissions' },
          { status: 403 }
        );
      }

      const { searchParams } = new URL(request.url);
      const paymentId = searchParams.get('id');
      
      if (!paymentId) {
        return NextResponse.json(
          { error: 'Payment ID is required' },
          { status: 400 }
        );
      }

      const payment = await getPaymentById(paymentId);
      if (!payment) {
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          customerEmail: payment.customerEmail,
          customerName: payment.customerName,
          paymentMethod: payment.paymentMethod,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
          metadata: payment.metadata
        }
      });
    } catch (error) {
      console.error('Failed to get payment status:', error);
      return NextResponse.json(
        { 
          error: 'Failed to get payment status',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  });
}
