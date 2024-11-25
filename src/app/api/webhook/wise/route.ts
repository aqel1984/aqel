import { NextRequest, NextResponse } from 'next/server';
import { updatePaymentStatus } from '@/lib/services/payment-tracking';
import { validateWiseWebhook } from '@/lib/security/webhook';
import { WiseWebhookEvent } from '@/types/wise';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-wise-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 400 }
      );
    }

    // Validate webhook signature
    const body = await request.text();
    const isValid = await validateWiseWebhook(body, signature);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body) as WiseWebhookEvent;
    const { data, event_type } = event;

    // Handle different event types
    switch (event_type) {
      case 'transfer.state-change':
        const transferId = data.resource.id;
        const status = data.current_state;

        // Map Wise status to our payment status
        let paymentStatus: 'pending' | 'completed' | 'failed';
        switch (status) {
          case 'outgoing_payment_sent':
            paymentStatus = 'completed';
            break;
          case 'cancelled':
          case 'failed':
            paymentStatus = 'failed';
            break;
          default:
            paymentStatus = 'pending';
        }

        // Update payment status
        await updatePaymentStatus(transferId, paymentStatus);
        break;

      // Add other event types as needed
      default:
        console.log(`Unhandled Wise webhook event type: ${event_type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process Wise webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
