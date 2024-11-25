import { NextResponse } from 'next/server';
import { postmarkService } from '@/utils/postmark-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, orderDetails } = body;

    if (!email || !orderDetails) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate order details
    const requiredFields = [
      'orderNumber',
      'customerName',
      'items',
      'total',
      'shippingAddress',
      'estimatedDelivery',
    ];

    const missingFields = requiredFields.filter(field => !(field in orderDetails));
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required order details: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const result = await postmarkService.sendOrderConfirmation(email, orderDetails);

    return NextResponse.json(
      { message: 'Order confirmation email sent', result },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to send order confirmation:', error);
    return NextResponse.json(
      { error: 'Failed to send order confirmation email' },
      { status: 500 }
    );
  }
}
