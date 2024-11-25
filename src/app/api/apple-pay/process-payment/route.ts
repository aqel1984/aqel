import { NextResponse } from 'next/server';
import { applePayService } from '@/utils/apple-pay-service';

export async function POST(request: Request) {
  try {
    const {
      token,
      amount,
      currency = 'GBP',
      description,
      metadata = {},
    } = await request.json();

    if (!token || !amount) {
      return NextResponse.json(
        { error: 'Payment token and amount are required' },
        { status: 400 }
      );
    }

    const paymentResult = await applePayService.processPayment({
      token,
      amount,
      currency,
      description,
      metadata,
    });

    return NextResponse.json({
      success: true,
      transactionId: paymentResult.transactionId,
      amount,
      currency,
      description,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing Apple Pay payment:', error);
    return NextResponse.json(
      {
        error: 'Payment processing failed',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
