import { ApiResponse, MonetaryAmount, Address } from './utils';

// Base payment types
export type PaymentMethod = 'applepay' | 'iban' | 'visadirect' | 'wise';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export interface BasePaymentRequest {
  amount: MonetaryAmount;
  description?: string;
  metadata?: Record<string, unknown>;
}

// Form data types
export interface FormData {
  amount: string;
  recipientName: string;
  iban: string;
  email: string;
  paymentMethod: PaymentMethod;
}

export interface FormErrors {
  amount?: string;
  recipientName?: string;
  iban?: string;
  email?: string;
  general?: string;
}

// Apple Pay specific types
export interface ApplePayPaymentRequest extends BasePaymentRequest {
  paymentMethod: 'applepay';
  billingContact?: {
    name: string;
    email: string;
    phone?: string;
    address?: Address;
  };
  shippingContact?: {
    name: string;
    email: string;
    phone?: string;
    address?: Address;
  };
}

// IBAN specific types
export interface IBANPaymentRequest extends BasePaymentRequest {
  paymentMethod: 'iban';
  recipientName: string;
  iban: string;
  bankName?: string;
  swiftCode?: string;
}

// Visa Direct specific types
export interface VisaDirectPaymentRequest extends BasePaymentRequest {
  paymentMethod: 'visadirect';
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  recipientName: string;
}

// Wise specific types
export interface WisePaymentRequest extends BasePaymentRequest {
  paymentMethod: 'wise';
  recipientEmail: string;
  recipientName: string;
  sourceAmount?: MonetaryAmount;
  targetAmount?: MonetaryAmount;
  quote?: {
    id: string;
    rate: number;
    fee: MonetaryAmount;
  };
}

// Payment response types
export interface PaymentResponse extends ApiResponse {
  data?: {
    transactionId: string;
    status: PaymentStatus;
    amount: MonetaryAmount;
    createdAt: string;
    updatedAt: string;
    paymentMethod: PaymentMethod;
    metadata?: Record<string, unknown>;
  };
}

// Payment validation types
export interface PaymentValidationRules {
  amount: {
    min: number;
    max: number;
    currency: string[];
  };
  iban?: {
    countries: string[];
    format: RegExp;
  };
  email: {
    format: RegExp;
  };
}
