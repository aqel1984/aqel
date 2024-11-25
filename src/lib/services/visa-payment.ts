import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { visaConfig } from '../config/visa';

export interface VisaCredentials {
  apiKey: string;
  sharedSecret: string;
  userId: string;
  password: string;
}

export interface VisaPaymentRequest {
  amount: number;
  currency: string;
  merchantTransactionId: string;
  cardNumber?: string;
  expirationDate?: string;
  cvv?: string;
  recipientName: string;
  recipientAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
}

export interface VisaRefundRequest {
  originalTransactionId: string;
  amount: number;
  reason: string;
}

export class VisaPaymentService {
  private credentials: VisaCredentials;
  private baseUrl: string;
  private certificates: {
    clientCert: Buffer;
    privateKey: Buffer;
    rootCa: Buffer;
    issuingCa: Buffer;
  };

  constructor() {
    this.credentials = {
      apiKey: process.env.VISA_API_KEY!,
      sharedSecret: process.env.VISA_API_SECRET!,
      userId: process.env.VISA_USER_ID!,
      password: process.env.VISA_PASSWORD!
    };
    this.baseUrl = visaConfig.apiUrl;
    
    // Load certificates
    const certPaths = visaConfig.certificates;
    this.certificates = {
      clientCert: fs.readFileSync(path.join(process.cwd(), certPaths.clientCert)),
      privateKey: fs.readFileSync(path.join(process.cwd(), certPaths.privateKey)),
      rootCa: fs.readFileSync(path.join(process.cwd(), certPaths.rootCa)),
      issuingCa: fs.readFileSync(path.join(process.cwd(), certPaths.issuingCa))
    };
  }

  private async createAxiosInstance() {
    const certs = this.certificates;
    return axios.create({
      baseURL: this.baseUrl,
      httpsAgent: new (require('https').Agent)({
        cert: certs.clientCert,
        key: certs.privateKey,
        ca: [certs.rootCa, certs.issuingCa],
        passphrase: this.credentials.sharedSecret,
        rejectUnauthorized: true
      }),
      headers: {
        'Authorization': `Basic ${Buffer.from(
          `${this.credentials.userId}:${this.credentials.password}`
        ).toString('base64')}`,
        'x-pay-token': this.generateXPayToken(),
        'Content-Type': 'application/json'
      },
      timeout: visaConfig.timeout.request
    });
  }

  private generateXPayToken(): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const resourcePath = visaConfig.endpoints.pushPayments;
    const queryString = '';
    const requestBody = '';

    const signatureString = `${this.credentials.apiKey}:${timestamp}:${resourcePath}:${queryString}:${requestBody}`;
    const hmac = require('crypto').createHmac('sha256', this.credentials.sharedSecret);
    const signature = hmac.update(signatureString).digest('hex');

    return `xv2:${timestamp}:${signature}`;
  }

  async processPayment(payment: VisaPaymentRequest) {
    try {
      const client = await this.createAxiosInstance();
      const response = await client.post(visaConfig.endpoints.pushPayments, {
        systemsTraceAuditNumber: Math.floor(Math.random() * 1000000).toString(),
        retrievalReferenceNumber: uuidv4().replace(/-/g, '').substring(0, 12),
        localTransactionDateTime: new Date().toISOString(),
        acquiringBin: visaConfig.acquiringBin,
        acquirerCountryCode: "840", // USA
        senderAccountNumber: payment.cardNumber,
        transactionCurrency: payment.currency,
        transactionAmount: payment.amount,
        merchantCategoryCode: visaConfig.merchantCategoryCode,
        merchantName: visaConfig.merchantName,
        merchantCountryCode: "840", // USA
        merchantId: visaConfig.merchantId,
        terminalId: visaConfig.terminalId,
        recipientName: payment.recipientName,
        recipientPrimaryAccountNumber: payment.cardNumber,
        cardExpiryDate: payment.expirationDate
      });

      return {
        transactionId: response.data.transactionId,
        status: response.data.actionCode === '00' ? 'success' : 'failed',
        authorizationCode: response.data.authorizationCode
      };
    } catch (error) {
      console.error('Visa payment processing error:', error);
      throw new Error('Failed to process Visa payment');
    }
  }

  async processRefund(refund: VisaRefundRequest) {
    try {
      const client = await this.createAxiosInstance();
      const response = await client.post(visaConfig.endpoints.refunds, {
        systemsTraceAuditNumber: Math.floor(Math.random() * 1000000).toString(),
        retrievalReferenceNumber: uuidv4().replace(/-/g, '').substring(0, 12),
        localTransactionDateTime: new Date().toISOString(),
        acquiringBin: visaConfig.acquiringBin,
        acquirerCountryCode: "840",
        originalDataElements: {
          systemsTraceAuditNumber: refund.originalTransactionId,
          approvalCode: "123456",
          transmissionDateTime: new Date().toISOString()
        },
        transactionIdentifier: refund.originalTransactionId,
        amount: refund.amount,
        reason: refund.reason
      });

      return {
        refundId: response.data.transactionId,
        status: response.data.actionCode === '00' ? 'success' : 'failed',
        processingDateTime: response.data.processingDateTime
      };
    } catch (error) {
      console.error('Visa refund processing error:', error);
      throw new Error('Failed to process Visa refund');
    }
  }

  async validateMerchant() {
    try {
      const client = await this.createAxiosInstance();
      const response = await client.post(visaConfig.endpoints.merchantValidation, {
        merchantId: visaConfig.merchantId,
        merchantCategoryCode: visaConfig.merchantCategoryCode,
        merchantCountryCode: "840"
      });

      return {
        isValid: response.data.isValid,
        merchantName: response.data.merchantName,
        merchantCity: response.data.merchantCity,
        merchantState: response.data.merchantState
      };
    } catch (error) {
      console.error('Visa merchant validation error:', error);
      throw new Error('Failed to validate Visa merchant');
    }
  }
}

export async function verifyVisaWebhookSignature(signature: string, payload: string): Promise<boolean> {
  try {
    const hmac = require('crypto').createHmac('sha256', visaConfig.webhookSecret);
    const expectedSignature = hmac.update(payload).digest('hex');
    return signature === expectedSignature;
  } catch (error) {
    console.error('Error verifying Visa webhook signature:', error);
    return false;
  }
}

export const visaPaymentService = new VisaPaymentService();
