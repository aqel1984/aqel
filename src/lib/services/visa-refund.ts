import { visaPaymentService } from './visa-payment';
import { logger } from '../../lib/logger';
import { redis } from '../../lib/redis';

const loggerInstance = logger('visa-refund-service');

export interface VisaRefundData {
  transactionId: string;
  amount: number;
  currency: string;
  reason: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  merchantId: string;
  customerEmail: string;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export class VisaRefundService {
  private readonly REFUND_KEY_PREFIX = 'visa:refund:';
  
  async initiateRefund(data: Omit<VisaRefundData, 'status' | 'createdAt' | 'completedAt'>) {
    const refundData: VisaRefundData = {
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const refundKey = `${this.REFUND_KEY_PREFIX}${data.transactionId}`;
    
    try {
      // Store refund request in Redis
      await redis.hset(refundKey, refundData);
      loggerInstance.info(`Initiated refund request for transaction ${data.transactionId}`);

      // Process refund through Visa Direct
      const refundResult = await visaPaymentService.processRefund({
        originalTransactionId: data.transactionId,
        amount: data.amount,
        reason: data.reason
      });

      if (refundResult.status === 'success') {
        // Update refund status to completed
        const completedData: VisaRefundData = {
          ...refundData,
          status: 'completed',
          completedAt: new Date().toISOString()
        };
        await redis.hset(refundKey, completedData);
        
        // Send email notification
        await this.sendRefundNotification(completedData);
        
        loggerInstance.info(`Completed refund for transaction ${data.transactionId}`);
        return completedData;
      } else {
        throw new Error('Refund processing failed');
      }
    } catch (error: any) {
      loggerInstance.error(`Failed to process refund for transaction ${data.transactionId}:`, error);
      
      // Update refund status to failed
      const failedData: VisaRefundData = {
        ...refundData,
        status: 'failed',
        errorMessage: error.message,
        completedAt: new Date().toISOString()
      };
      await redis.hset(refundKey, failedData);
      
      throw error;
    }
  }

  async getRefundStatus(transactionId: string): Promise<VisaRefundData | null> {
    const refundKey = `${this.REFUND_KEY_PREFIX}${transactionId}`;
    const refundData = await redis.hgetall(refundKey);
    return refundData ? refundData as VisaRefundData : null;
  }

  async listPendingRefunds(): Promise<VisaRefundData[]> {
    const keys = await redis.keys(`${this.REFUND_KEY_PREFIX}*`);
    const refunds: VisaRefundData[] = [];

    for (const key of keys) {
      const refund = await redis.hgetall(key);
      if (refund && refund.status === 'pending') {
        refunds.push(refund as VisaRefundData);
      }
    }

    return refunds;
  }

  private async sendRefundNotification(refund: VisaRefundData) {
    try {
      // Implementation for sending email notification
      // This should be implemented based on your email service provider
      loggerInstance.info(`Sending refund notification email to ${refund.customerEmail}`);
      
      // Example email content
      const emailContent = {
        to: refund.customerEmail,
        subject: 'Refund Processed Successfully',
        body: `
          Dear Customer,
          
          Your refund for transaction ${refund.transactionId} has been processed successfully.
          
          Amount: ${refund.amount} ${refund.currency}
          Date: ${refund.completedAt}
          
          If you have any questions, please contact our support team.
          
          Best regards,
          Aqel Jehad Ltd
        `
      };

      // Send email using your email service
      // await emailService.send(emailContent);
      
    } catch (error) {
      loggerInstance.error('Failed to send refund notification email:', error);
      // Don't throw error as this is a non-critical operation
    }
  }
}

export const visaRefundService = new VisaRefundService();
