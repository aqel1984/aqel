import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { 
  createPaymentLink,
  getPaymentLink,
  listPaymentLinks,
  cancelPaymentLink,
  PaymentLink
} from '@/lib/services/payment-link';
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
      const id = searchParams.get('id');
      const status = searchParams.get('status') as PaymentLink['status'] | undefined;
      const userId = request.headers.get('x-user-id') || 'anonymous';

      if (id) {
        const paymentLink = await getPaymentLink(id);
        if (!paymentLink) {
          return NextResponse.json(
            { error: 'Payment link not found' },
            { status: 404 }
          );
        }

        // Only allow access to own payment links
        if (paymentLink.createdBy !== userId) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 403 }
          );
        }

        return NextResponse.json({
          success: true,
          paymentLink,
        });
      }

      const links = await listPaymentLinks(userId, status);
      return NextResponse.json({
        success: true,
        paymentLinks: links,
      });
    } catch (error) {
      console.error('Failed to get payment links:', error);
      return NextResponse.json(
        { 
          error: 'Failed to get payment links',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return authMiddleware(request, async (_, user) => {
    try {
      if (!user.roles.includes('payment:write')) {
        return NextResponse.json(
          { error: 'Unauthorized - Insufficient permissions' },
          { status: 403 }
        );
      }

      const data = await request.json();
      const link = await createPaymentLink({
        ...data,
        createdBy: request.headers.get('x-user-id') || 'anonymous'
      });
      return NextResponse.json({ success: true, link });
    } catch (error) {
      console.error('Failed to create payment link:', error);
      return NextResponse.json(
        { 
          error: 'Failed to create payment link',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(request: NextRequest) {
  return authMiddleware(request, async (_, user) => {
    try {
      if (!user.roles.includes('payment:write')) {
        return NextResponse.json(
          { error: 'Unauthorized - Insufficient permissions' },
          { status: 403 }
        );
      }

      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      
      if (!id) {
        return NextResponse.json(
          { error: 'Payment link ID is required' },
          { status: 400 }
        );
      }

      const paymentLink = await getPaymentLink(id);
      if (!paymentLink) {
        return NextResponse.json(
          { error: 'Payment link not found' },
          { status: 404 }
        );
      }

      // Only allow cancellation of own payment links
      if (paymentLink.createdBy !== request.headers.get('x-user-id')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      const cancelledLink = await cancelPaymentLink(id);
      return NextResponse.json({
        success: true,
        paymentLink: cancelledLink,
      });
    } catch (error) {
      console.error('Failed to cancel payment link:', error);
      return NextResponse.json(
        { 
          error: 'Failed to cancel payment link',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  });
}
