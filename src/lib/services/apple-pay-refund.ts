import { ApplePayService } from './apple-pay';
import fs from 'fs';
import path from 'path';

export class ApplePayRefundService extends ApplePayService {
  private merchantIdentityCertPath: string;
  private privateKeyPath: string;

  constructor() {
    super();
    this.merchantIdentityCertPath = path.join(process.cwd(), 'certificates', 'apple-pay-merchant-identity.pem');
    this.privateKeyPath = path.join(process.cwd(), 'certificates', 'apple-pay-private-key.pem');
  }

  protected override getAuthToken(): string {
    try {
      const merchantIdentityCert = fs.readFileSync(this.merchantIdentityCertPath, 'utf8');
      const privateKey = fs.readFileSync(this.privateKeyPath, 'utf8');

      // Generate JWT token using the certificates
      const token = this.generateToken(merchantIdentityCert, privateKey);
      return token;
    } catch (error) {
      console.error('Failed to read Apple Pay certificates:', error);
      throw new Error('Failed to initialize Apple Pay authentication');
    }
  }

  async processRefund(paymentId: string, amount: number): Promise<{ refundId: string; status: string }> {
    try {
      const session = await this.createRefundSession({
        paymentId,
        amount,
        currency: 'USD',
      });

      const refundId = await this.submitRefund(session.id);

      return {
        refundId,
        status: 'processing'
      };
    } catch (error) {
      console.error('Failed to process Apple Pay refund:', error);
      throw new Error('Failed to process refund');
    }
  }

  async updateRefundStatus(refundId: string, status: string): Promise<{ status: string }> {
    try {
      const validStatuses = ['completed', 'failed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid refund status');
      }

      await this.updateRefund(refundId, { status });

      return { status };
    } catch (error) {
      console.error('Failed to update Apple Pay refund status:', error);
      throw new Error('Failed to update refund status');
    }
  }

  private async createRefundSession(params: {
    paymentId: string;
    amount: number;
    currency: string;
  }): Promise<{ id: string }> {
    const response = await fetch('https://apple-pay-gateway.apple.com/paymentservices/refundSession', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `ApplePay ${this.getAuthToken()}`
      },
      body: JSON.stringify({
        paymentId: params.paymentId,
        amount: params.amount.toFixed(2),
        currencyCode: params.currency,
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create refund session');
    }

    return response.json();
  }

  private async submitRefund(refundId: string): Promise<string> {
    const response = await fetch(`https://apple-pay-gateway.apple.com/paymentservices/refunds/${refundId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `ApplePay ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to submit refund');
    }

    return refundId;
  }

  private async updateRefund(refundId: string, params: { status: string }): Promise<void> {
    const response = await fetch(`https://apple-pay-gateway.apple.com/paymentservices/refunds/${refundId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `ApplePay ${this.getAuthToken()}`
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error('Failed to update refund');
    }
  }
}
