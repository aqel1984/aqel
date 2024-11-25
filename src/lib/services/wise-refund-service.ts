import { WiseClient } from '@/lib/clients/wise';

export interface WiseRefundParams {
  paymentId: string;
  amount: number;
  currency: string;
  reason: string;
}

export interface WiseRefundResult {
  success: boolean;
  refundId?: string;
  error?: string;
  status?: string;
}

export class WiseRefundService {
  private client: WiseClient;

  constructor() {
    this.client = new WiseClient({
      apiKey: process.env.WISE_API_KEY!,
      profileId: process.env.WISE_PROFILE_ID!,
    });
  }

  async processRefund(params: WiseRefundParams): Promise<WiseRefundResult> {
    try {
      // Get the original transfer details
      const transfer = await this.client.getTransfer(params.paymentId);
      if (!transfer) {
        return {
          success: false,
          error: 'Original transfer not found',
        };
      }

      // Validate refund amount
      if (params.amount <= 0 || params.amount > transfer.sourceAmount) {
        return {
          success: false,
          error: 'Invalid refund amount',
        };
      }

      // Create refund
      const refund = await this.client.createRefund({
        transferId: params.paymentId,
        amount: params.amount,
        currency: params.currency,
        reason: params.reason,
      });

      // Check refund status
      if (!refund.id) {
        return {
          success: false,
          error: 'Failed to create refund',
        };
      }

      return {
        success: true,
        refundId: refund.id,
        status: refund.status,
      };
    } catch (error) {
      console.error('Failed to process Wise refund:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process refund',
      };
    }
  }

  async getRefundStatus(refundId: string): Promise<string> {
    try {
      const refund = await this.client.getRefund(refundId);
      return refund.status;
    } catch (error) {
      console.error('Failed to get refund status:', error);
      throw error;
    }
  }
}
