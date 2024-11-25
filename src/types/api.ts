// Payment Responses
export interface PaymentResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  error?: string;
}

export interface WisePaymentResponse extends PaymentResponse {
  transferId?: string;
  status?: 'pending' | 'processing' | 'complete' | 'failed';
  estimatedDeliveryDate?: string;
}

export interface ApplePayResponse extends PaymentResponse {
  token?: string;
  paymentId?: string;
  merchantSessionIdentifier?: string;
}

export interface VisaDirectResponse extends PaymentResponse {
  pushPaymentId?: string;
  status?: 'PENDING' | 'PROCESSED' | 'FAILED';
  statusDescription?: string;
}

// Apple Pay Types
export interface ApplePaySession {
  merchantIdentifier: string;
  domainName: string;
  displayName: string;
}

export interface ApplePayValidationResponse {
  success: boolean;
  error?: string;
  merchantSession?: any; // Replace with proper type from Apple Pay documentation
}

// Wise Types
export interface WiseRecipient {
  id: string;
  name: string;
  iban?: string;
}

export interface WisePaymentLink {
  url: string;
  id: string;
}

// Logger Types
export interface TransactionLog {
  id: string;
  timestamp: string;
  paymentMethod: 'apple-pay' | 'wise' | 'visa-direct';
  amount: number;
  currency: string;
  status: string;
  metadata: Record<string, any>;
}

// Test Response Types
export interface TestResponse {
  success: boolean;
  message: string;
  data?: any;
}

import { Database } from './database.types';

export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];

export interface MerchantValidationResponse {
  success: boolean;
  session?: object;
  error?: string;
}
