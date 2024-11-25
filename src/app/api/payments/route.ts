import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createPayment } from '@/lib/services/payment-tracking';
import { WiseClient } from '@/lib/clients/wise';
import { sendEmail } from '@/lib/services/email';

// Input validation schema
const createPaymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  customerEmail: z.string().email(),
  customerName: z.string(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate input
    const validatedData = createPaymentSchema.parse(data);
    
    // Initialize Wise client
    const wiseClient = new WiseClient({
      apiKey: process.env['WISE_API_KEY']!,
      profileId: process.env['WISE_PROFILE_ID']!
    });
    
    // Create quote
    const quote = await wiseClient.createQuote({
      sourceCurrency: validatedData.currency,
      targetCurrency: validatedData.currency, // Same currency for now
      sourceAmount: validatedData.amount,
    });
    
    // Create transfer
    const transfer = await wiseClient.createTransfer({
      targetAccount: process.env['WISE_TARGET_ACCOUNT_ID']!,
      quoteId: quote.id,
      customerTransactionId: `PAY-${Date.now()}`,
      details: {
        reference: validatedData.description || 'Payment',
        transferPurpose: 'service',
        sourceOfFunds: 'other',
      },
    });
    
    // Track payment in our system
    const payment = await createPayment({
      id: transfer.id,
      status: 'pending',
      amount: validatedData.amount,
      currency: validatedData.currency,
      customerEmail: validatedData.customerEmail,
      customerName: validatedData.customerName,
      paymentMethod: 'wise',
      metadata: {
        ...validatedData.metadata,
        quoteId: quote.id,
        transferId: transfer.id,
      },
    });

    // Send confirmation email
    await sendEmail({
      to: validatedData.customerEmail,
      template: 'payment-confirmation',
      data: {
        customerName: validatedData.customerName,
        amount: validatedData.amount,
        currency: validatedData.currency,
        paymentId: payment.id,
        description: validatedData.description,
      },
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
      },
    });
  } catch (error) {
    console.error('Failed to process payment:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to process payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
