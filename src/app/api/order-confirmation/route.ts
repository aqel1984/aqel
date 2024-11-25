import { NextResponse } from 'next/server';
import { emailService } from '@/utils/email-service';

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

    const result = await emailService.sendOrderConfirmation(email, orderDetails);

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
