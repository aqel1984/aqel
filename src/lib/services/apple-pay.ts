import { APPLE_PAY_CONFIG } from '../config/apple-pay';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

interface ApplePayPaymentRequest {
  countryCode: string;
  currencyCode: string;
  supportedNetworks: string[];
  merchantCapabilities: string[];
  total: {
    label: string;
    amount: string;
  };
}

export class ApplePayService {
  private merchantIdentifier: string;
  private domainName: string;
  private displayName: string;

  constructor() {
    this.merchantIdentifier = process.env['APPLE_PAY_MERCHANT_ID'] || '';
    this.domainName = process.env['APPLE_PAY_DOMAIN'] || '';
    this.displayName = 'Aqel Jehad Ltd';
  }

  async createPaymentSession(amount: number, currency: string = 'USD'): Promise<ApplePayPaymentRequest> {
    return {
      countryCode: 'US',
      currencyCode: currency,
      supportedNetworks: ['visa', 'masterCard', 'amex'],
      merchantCapabilities: ['supports3DS'],
      total: {
        label: this.displayName,
        amount: amount.toFixed(2),
      },
    };
  }

  async validateMerchant(validationURL: string): Promise<any> {
    try {
      const response = await fetch('https://apple-pay-gateway.example.com/validate-merchant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          validationURL,
          merchantIdentifier: this.merchantIdentifier,
          displayName: this.displayName,
          domainName: this.domainName,
        }),
      });

      if (!response.ok) {
        throw new Error('Merchant validation failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Apple Pay merchant validation error:', error);
      throw error;
    }
  }

  async processPayment(token: string, amount: number): Promise<any> {
    try {
      const response = await fetch('https://your-payment-processor.com/process-apple-pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          amount,
          merchantIdentifier: this.merchantIdentifier,
        }),
      });

      if (!response.ok) {
        throw new Error('Payment processing failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Apple Pay payment processing error:', error);
      throw error;
    }
  }

  protected generateToken(merchantIdentityCert: string, privateKey: string): string {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: APPLE_PAY_CONFIG['merchantId'],
      iat: now,
      exp: now + 3600, // Token expires in 1 hour
      aud: 'https://apple-pay-gateway.apple.com',
      sub: APPLE_PAY_CONFIG['merchantDomain']
    };

    return jwt.sign(payload, privateKey, {
      algorithm: 'ES256',
      header: {
        alg: 'ES256',
        x5c: [Buffer.from(merchantIdentityCert).toString('base64')]
      }
    });
  }

  protected async validateMerchantWithCertificate(): Promise<boolean> {
    try {
      const certificatePath = path.join(process.cwd(), APPLE_PAY_CONFIG.certificatePaths.certificate);
      const certificate = fs.readFileSync(certificatePath, 'utf8');

      // Validate the merchant certificate with Apple Pay servers
      const response = await fetch('https://apple-pay-gateway.apple.com/paymentservices/validateMerchant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `ApplePay ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          merchantIdentifier: APPLE_PAY_CONFIG.merchantId,
          domainName: APPLE_PAY_CONFIG.merchantDomain,
          displayName: APPLE_PAY_CONFIG.displayName,
          merchantCertificate: certificate
        })
      });

      if (!response.ok) {
        throw new Error('Merchant validation failed');
      }

      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error('Failed to validate merchant:', error);
      return false;
    }
  }

  protected getAuthToken(): string {
    try {
      const merchantIdentityCertPath = path.join(process.cwd(), APPLE_PAY_CONFIG.certificatePaths.merchantIdentity);
      const privateKeyPath = path.join(process.cwd(), APPLE_PAY_CONFIG.certificatePaths.privateKey);

      const merchantIdentityCert = fs.readFileSync(merchantIdentityCertPath, 'utf8');
      const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

      return this.generateToken(merchantIdentityCert, privateKey);
    } catch (error) {
      console.error('Failed to generate auth token:', error);
      throw new Error('Failed to initialize Apple Pay authentication');
    }
  }
}
