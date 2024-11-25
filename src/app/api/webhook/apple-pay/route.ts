import { NextRequest, NextResponse } from 'next/server';
import { updatePaymentStatus, createPayment } from '@/lib/services/payment-tracking';
import { validateWebhookSignature } from '@/lib/security/webhook';

const APPLE_PAY_WEBHOOK_SECRET = process.env['APPLE_PAY_WEBHOOK_SECRET'];

export async function POST(request: NextRequest) {
  try {
    if (!APPLE_PAY_WEBHOOK_SECRET) {
      console.error('APPLE_PAY_WEBHOOK_SECRET is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const signature = request.headers.get('x-apple-pay-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 400 }
      );
    }

    // Validate webhook signature
    const isValid = await validateWebhookSignature(
      await request.text(),
      signature,
      APPLE_PAY_WEBHOOK_SECRET
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      paymentId,
      status,
      amount,
      currency,
      customerEmail,
      customerName,
    } = body;

    // Create or update payment
    if (status === 'created') {
      await createPayment({
        id: paymentId,
        status: 'pending',
        amount,
        currency,
        customerEmail,
        customerName,
        paymentMethod: 'apple_pay',
      });
    } else {
      await updatePaymentStatus(
        paymentId,
        status === 'succeeded' ? 'completed' : 'failed'
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process Apple Pay webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
