import { NextResponse } from 'next/server';
import { PaymentLogger } from '@/lib/services/payment-logger';

export async function GET(
  _request: Request,
  { params }: { params: { transactionId: string } }
) {
  try {
    const transactionId = params.transactionId;
    
    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const log = await PaymentLogger.getTransactionLog(transactionId);
    
    if (!log) {
      return NextResponse.json(
        { error: 'Transaction log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(log);
  } catch (error) {
    console.error('Error retrieving transaction log:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve transaction log' },
      { status: 500 }
    );
  }
}
