'use client'

import axios from 'axios';

export interface PaymentRequest {
  amount: number;
  currency: string;
  email: string;
  name: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface VisaDirectRequest extends PaymentRequest {
  recipientCard: {
    number: string;
    expiryMonth: string;
    expiryYear: string;
    recipientName: string;
  };
}

export interface WiseQuoteRequest {
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: number;
  targetAmount?: number;
}

export interface WiseRecipientRequest {
  currency: string;
  type: 'apple_pay' | 'visa_direct';
  fullName: string;
  email: string;
  accountDetails?: {
    cardNumber?: string;
    expiryMonth?: string;
    expiryYear?: string;
  };
}

class PaymentService {
  private readonly wiseApi: string;
  private readonly wiseHeaders: { [key: string]: string };

  constructor() {
    this.wiseApi = process.env['WISE_API_URL'] || 'https://api.transferwise.com';
    this.wiseHeaders = {
      'Authorization': `Bearer ${process.env['WISE_API_KEY']}`,
      'Content-Type': 'application/json'
    };
  }

  // Create quote for transfer
  async createQuote(request: WiseQuoteRequest) {
    try {
      const response = await axios.post(
        `${this.wiseApi}/v3/profiles/${process.env['WISE_PROFILE_ID']}/quotes`,
        {
          sourceAmount: request.sourceAmount,
          sourceCurrency: request.sourceCurrency,
          targetCurrency: request.targetCurrency,
          targetAmount: request.targetAmount,
          payOut: 'BALANCE'
        },
        { headers: this.wiseHeaders }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating Wise quote:', error);
      throw error;
    }
  }

  // Create recipient
  async createRecipient(request: WiseRecipientRequest) {
    try {
      const response = await axios.post(
        `${this.wiseApi}/v1/accounts`,
        {
          currency: request.currency,
          type: request.type,
          profile: process.env['WISE_PROFILE_ID'],
          accountHolderName: request.fullName,
          email: request.email,
          details: request.accountDetails
        },
        { headers: this.wiseHeaders }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating Wise recipient:', error);
      throw error;
    }
  }

  // Create transfer
  async createTransfer(quoteId: string, targetAccountId: string, reference: string) {
    try {
      const response = await axios.post(
        `${this.wiseApi}/v1/transfers`,
        {
          targetAccount: targetAccountId,
          quoteUuid: quoteId,
          customerTransactionId: `${Date.now()}`,
          details: {
            reference,
            transferPurpose: 'Purchase payment',
            sourceOfFunds: 'business'
          }
        },
        { headers: this.wiseHeaders }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating Wise transfer:', error);
      throw error;
    }
  }

  // Fund transfer
  async fundTransfer(transferId: string) {
    try {
      const response = await axios.post(
        `${this.wiseApi}/v3/profiles/${process.env['WISE_PROFILE_ID']}/transfers/${transferId}/payments`,
        {
          type: 'BALANCE'
        },
        { headers: this.wiseHeaders }
      );
      return response.data;
    } catch (error) {
      console.error('Error funding Wise transfer:', error);
      throw error;
    }
  }

  // Create Apple Pay payment link
  async createApplePayLink(request: PaymentRequest) {
    try {
      // 1. Create quote
      const quote = await this.createQuote({
        sourceCurrency: request.currency,
        targetCurrency: request.currency,
        sourceAmount: request.amount
      });

      // 2. Create recipient
      const recipient = await this.createRecipient({
        currency: request.currency,
        type: 'apple_pay',
        fullName: request.name,
        email: request.email
      });

      // 3. Create transfer
      const transfer = await this.createTransfer(
        quote.id,
        recipient.id,
        request.description
      );

      // 4. Generate Apple Pay payment link
      const response = await axios.post(
        '/api/payments/apple-pay/create-link',
        {
          transferId: transfer.id,
          amount: request.amount,
          currency: request.currency,
          description: request.description
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating Apple Pay link:', error);
      throw error;
    }
  }

  // Process Visa Direct payment
  async processVisaDirectPayment(request: VisaDirectRequest) {
    try {
      // 1. Create quote
      const quote = await this.createQuote({
        sourceCurrency: request.currency,
        targetCurrency: request.currency,
        sourceAmount: request.amount
      });

      // 2. Create recipient with card details
      const recipient = await this.createRecipient({
        currency: request.currency,
        type: 'visa_direct',
        fullName: request.recipientCard.recipientName,
        email: request.email,
        accountDetails: {
          cardNumber: request.recipientCard.number,
          expiryMonth: request.recipientCard.expiryMonth,
          expiryYear: request.recipientCard.expiryYear
        }
      });

      // 3. Create transfer
      const transfer = await this.createTransfer(
        quote.id,
        recipient.id,
        request.description
      );

      // 4. Fund the transfer
      await this.fundTransfer(transfer.id);

      // 5. Process Visa Direct payment
      const response = await axios.post('/api/payments/visa-direct/process', {
        transferId: transfer.id,
        ...request
      });

      return response.data;
    } catch (error) {
      console.error('Error processing Visa Direct payment:', error);
      throw error;
    }
  }

  // Get transfer status
  async getTransferStatus(transferId: string) {
    try {
      const response = await axios.get(
        `${this.wiseApi}/v1/transfers/${transferId}`,
        { headers: this.wiseHeaders }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting transfer status:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
