import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { VisaDirectService } from '@/utils/visa-direct-service';

// Initialize Visa Direct service
const visaDirectService = VisaDirectService.getInstance();

// Process push payment
export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const {
        senderCardNumber,
        recipientCardNumber,
        amount,
        currency,
        senderName,
        recipientName,
        purpose,
      } = await req.json();

      // Validate required fields
      if (!senderCardNumber || !recipientCardNumber || !amount) {
        return NextResponse.json(
          {
            error: 'Missing required fields',
            details: 'Card numbers and amount are required',
          },
          { status: 400 }
        );
      }

      // Process payment through Visa Direct
      const response = await visaDirectService.pushFundsTransfer({
        senderCardNumber,
        recipientCardNumber,
        amount,
        currency: currency || process.env['VISA_DEFAULT_CURRENCY']!,
        senderName,
        recipientName,
        purpose,
      });

      return NextResponse.json(response);
    } catch (error: any) {
      console.error('Visa Direct payment error:', error);
      return NextResponse.json(
        {
          error: 'Payment processing failed',
          details: error.message,
        },
        { status: 500 }
      );
    }
  });
}

// Get transaction status
export async function GET(request: NextRequest) {
  return withAuth(request, async (_req) => {
    try {
      const { searchParams } = new URL(request.url);
      const transactionId = searchParams.get('transactionId');

      if (!transactionId) {
        return NextResponse.json(
          {
            error: 'Missing transaction ID',
            details: 'Transaction ID is required',
          },
          { status: 400 }
        );
      }

      const status = await visaDirectService.getTransactionStatus(transactionId);
      return NextResponse.json(status);
    } catch (error: any) {
      console.error('Visa Direct status check error:', error);
      return NextResponse.json(
        {
          error: 'Status check failed',
          details: error.message,
        },
        { status: 500 }
      );
    }
  });
}
