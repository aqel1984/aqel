import { sendEmail } from './email';
import { getPaymentById, updatePaymentStatus } from './payment-tracking';
import { WiseRefundService } from './wise-refund-service';

export class RefundError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'RefundError';
  }
}

export interface RefundRequest {
  paymentId: string;
  reason: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processed' | 'rejected';
  customerEmail: string;
  requestDate: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  error?: string;
  status?: string;
}

export async function createRefundRequest(request: RefundRequest): Promise<RefundResult> {
  try {
    // Get payment details
    const payment = await getPaymentById(request.paymentId);
    if (!payment) {
      throw new RefundError('Payment not found');
    }

    // Validate refund amount
    if (request.amount <= 0 || request.amount > payment.amount) {
      throw new RefundError('Invalid refund amount');
    }

    // Create refund request
    const refundResult = await processRefund(request);

    // Update payment status if refund is successful
    if (refundResult.success) {
      await updatePaymentStatus(payment.id, 'refunded');
    }

    return refundResult;
  } catch (error) {
    console.error('Failed to create refund request:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create refund request'
    };
  }
}

export async function processRefund(request: RefundRequest): Promise<RefundResult> {
  try {
    // Get payment details
    const payment = await getPaymentById(request.paymentId);
    if (!payment) {
      throw new RefundError('Payment not found');
    }

    // Validate refund amount
    if (request.amount <= 0 || request.amount > payment.amount) {
      throw new RefundError('Invalid refund amount');
    }

    // Process refund based on payment method
    const refundService = new WiseRefundService();
    const refundResult = await refundService.processRefund({
      paymentId: payment.id,
      amount: request.amount,
      currency: request.currency,
      reason: request.reason
    });

    // Send refund confirmation email
    if (refundResult.success) {
      await sendEmail({
        to: payment.customerEmail,
        template: 'refund-confirmation',
        data: {
          subject: 'Refund Processed',
          refundId: refundResult.refundId,
          amount: request.amount,
          currency: request.currency,
          reason: request.reason,
          paymentId: payment.id,
          customerName: payment.customerName,
          date: new Date().toLocaleDateString()
        }
      });
    }

    return refundResult;
  } catch (error) {
    console.error('Failed to process refund:', error);
    throw new RefundError(
      error instanceof Error ? error.message : 'Failed to process refund',
      error
    );
  }
}
