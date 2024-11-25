import { NextResponse } from 'next/server';
import { PaymentLogger } from '@/lib/services/payment-logger';
import crypto from 'crypto';

// Test card responses - each test card will trigger a specific response
const TEST_CARD_RESPONSES = {
  '4111111111111111': { success: true, code: '00', message: 'Approved' },
  '4000000000000002': { success: false, code: '05', message: 'Declined' },
  '4000000000000069': { success: false, code: '51', message: 'Insufficient funds' },
  '4000000000000077': { success: false, code: 'T0', message: 'Timeout error' },
  '4000000000000127': { success: false, code: '14', message: 'Invalid card' },
  '4000000000000085': { success: false, code: '54', message: 'Expired card' },
  '4000000000000093': { success: false, code: '57', message: 'Transaction not permitted to cardholder' }
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency, card, description } = body;

    if (!amount || !currency || !card) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Remove spaces from card number for comparison
    const cardNumber = card.number.replace(/\s/g, '');
    
    // Generate unique transaction ID
    const transactionId = `VD-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    // Get test response based on card number
    const testResponse = TEST_CARD_RESPONSES[cardNumber as keyof typeof TEST_CARD_RESPONSES] || {
      success: false,
      code: '96',
      message: 'System error, retry transaction'
    };

    // Simulate processing delay (1-2 seconds)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Create response data
    const responseData = {
      success: testResponse.success,
      transactionId,
      actionCode: testResponse.code,
      message: testResponse.message,
      amount,
      currency,
      card: {
        last4: cardNumber.slice(-4),
        brand: 'visa',
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear
      },
      timestamp: new Date().toISOString(),
      description
    };

    // Log the transaction
    await PaymentLogger.logTransaction({
      transactionId,
      amount: Number(amount),
      currency,
      paymentMethod: 'visa_direct',
      status: testResponse.success ? 'completed' : 'failed',
      cardLast4: cardNumber.slice(-4),
      errorMessage: !testResponse.success ? testResponse.message : '', // Set a default empty string instead of undefined
      metadata: {
        testCard: true,
        responseCode: testResponse.code,
        description
      }
    });

    // Return response with appropriate status code
    return NextResponse.json(
      responseData,
      { status: testResponse.success ? 200 : 402 }
    );

  } catch (error) {
    console.error('Error processing card payment:', error);
    
    // Log error
    const errorTransactionId = `VD-ERROR-${Date.now()}`;
    await PaymentLogger.logTransaction({
      transactionId: errorTransactionId,
      amount: 0,
      currency: 'USD',
      paymentMethod: 'visa_direct',
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        error: true,
        errorDetails: error instanceof Error ? error.stack : undefined
      }
    });

    return NextResponse.json(
      { 
        success: false,
        transactionId: errorTransactionId,
        error: 'Error processing payment',
        message: error instanceof Error ? error.message : 'System error'
      },
      { status: 500 }
    );
  }
}
