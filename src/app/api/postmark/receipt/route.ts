import { NextResponse } from 'next/server';
import { postmarkService } from '@/utils/postmark-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, receiptDetails } = body;

    if (!email || !receiptDetails) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate receipt details
    const requiredFields = [
      'name',
      'productName',
      'productUrl',
      'receiptId',
      'date',
      'description',
      'amount',
      'creditCard',
    ];

    const missingFields = requiredFields.filter(field => !(field in receiptDetails));
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required receipt details: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate credit card details
    const requiredCreditCardFields = ['brand', 'lastFour', 'statementName'];
    const missingCreditCardFields = requiredCreditCardFields.filter(
      field => !(field in receiptDetails.creditCard)
    );
    if (missingCreditCardFields.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required credit card details: ${missingCreditCardFields.join(
            ', '
          )}`,
        },
        { status: 400 }
      );
    }

    const result = await postmarkService.sendReceiptEmail(email, receiptDetails);

    return NextResponse.json(
      { message: 'Receipt email sent successfully', result },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to send receipt email:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send receipt email',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
