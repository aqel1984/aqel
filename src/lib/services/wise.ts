import axios, { AxiosError } from 'axios';
import { z } from 'zod';

// Environment variable validation
const requiredEnvSchema = z.object({
  WISE_API_KEY: z.string(),
  WISE_PROFILE_ID: z.string(),
  WISE_API_URL: z.string().default('https://api.transferwise.com'),
  WISE_SANDBOX_API_URL: z.string().optional(),
});

const env = requiredEnvSchema.parse({
  WISE_API_KEY: process.env['WISE_API_KEY'],
  WISE_PROFILE_ID: process.env['WISE_PROFILE_ID'],
  WISE_API_URL: process.env['WISE_API_URL'],
  WISE_SANDBOX_API_URL: process.env['WISE_SANDBOX_API_URL'],
});

// Error types
export class WiseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'WiseError';
  }
}

// Configure Wise API client
const wiseClient = axios.create({
  baseURL: env.WISE_API_URL,
  headers: {
    'Authorization': `Bearer ${env.WISE_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

interface WiseQuoteRequest {
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount?: number;
  targetAmount?: number;
}

interface WiseTransferRequest {
  targetAccount: string;
  quoteId: string;
  customerTransactionId: string;
  details: {
    reference: string;
    transferPurpose?: string;
    sourceOfFunds?: string;
  };
}

export async function createQuote({
  sourceCurrency,
  targetCurrency,
  sourceAmount,
  targetAmount
}: WiseQuoteRequest) {
  try {
    const response = await wiseClient.post('/v3/quotes', {
      sourceCurrency,
      targetCurrency,
      sourceAmount,
      targetAmount,
      profile: env.WISE_PROFILE_ID,
      paymentMetadata: {
        transferType: 'BALANCE_PAYOUT',
        paymentMethod: 'BALANCE'
      }
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new WiseError(
        'Failed to create quote',
        'QUOTE_CREATION_FAILED',
        error.response?.status,
        error.response?.data
      );
    }
    throw error;
  }
}

export async function createTransfer(transferRequest: WiseTransferRequest) {
  try {
    const response = await wiseClient.post('/v1/transfers', {
      ...transferRequest,
      profile: env.WISE_PROFILE_ID
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new WiseError(
        'Failed to create transfer',
        'TRANSFER_CREATION_FAILED',
        error.response?.status,
        error.response?.data
      );
    }
    throw error;
  }
}

export async function getAccountBalance(currency: string = 'USD') {
  try {
    const response = await wiseClient.get(`/v4/profiles/${env.WISE_PROFILE_ID}/balances?types=STANDARD`);
    const balances = response.data;
    
    const currencyBalance = balances.find((balance: any) => balance.currency === currency);
    if (!currencyBalance) {
      throw new WiseError(
        `No balance found for currency ${currency}`,
        'BALANCE_NOT_FOUND',
        404
      );
    }
    
    return currencyBalance;
  } catch (error) {
    if (error instanceof WiseError) {
      throw error;
    }
    if (error instanceof AxiosError) {
      throw new WiseError(
        'Failed to get balance',
        'BALANCE_FETCH_FAILED',
        error.response?.status,
        error.response?.data
      );
    }
    throw error;
  }
}

export async function getTransferStatus(transferId: string) {
  try {
    const response = await wiseClient.get(`/v1/transfers/${transferId}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new WiseError(
        'Failed to get transfer status',
        'TRANSFER_STATUS_FAILED',
        error.response?.status,
        error.response?.data
      );
    }
    throw error;
  }
}

export async function cancelTransfer(transferId: string) {
  try {
    const response = await wiseClient.put(`/v1/transfers/${transferId}/cancel`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new WiseError(
        'Failed to cancel transfer',
        'TRANSFER_CANCELLATION_FAILED',
        error.response?.status,
        error.response?.data
      );
    }
    throw error;
  }
}
