import { NextResponse } from 'next/server';
import { createQuote } from '@/lib/services/wise';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { amount, currency = 'USD' } = await req.json();

    if (!amount) {
      return NextResponse.json(
        { error: 'Amount is required' },
        { status: 400 }
      );
    }

    // Create a quote using Wise API
    const quote = await createQuote({
      sourceCurrency: currency,
      targetCurrency: currency,
      sourceAmount: amount
    });

    // Generate a unique transaction reference
    const transactionReference = `WISE-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    return NextResponse.json({
      success: true,
      quoteId: quote.id,
      transactionReference,
      rate: quote.rate,
      fee: quote.fee,
      estimatedDelivery: quote.estimatedDelivery,
      sourceAmount: quote.sourceAmount,
      targetAmount: quote.targetAmount,
      sourceCurrency: quote.sourceCurrency,
      targetCurrency: quote.targetCurrency
    });
  } catch (error) {
    console.error('Error creating payment session:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create payment session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
