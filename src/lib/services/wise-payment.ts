import axios, { AxiosError } from 'axios';

const WISE_API_URL = process.env['WISE_API_URL'] || 'https://api.transferwise.com';
const WISE_API_KEY = process.env['WISE_API_KEY'];
const WISE_PROFILE_ID = process.env['WISE_PROFILE_ID'];

interface WiseQuote {
  id: string;
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: number;
  targetAmount: number;
  rate: number;
}

interface WiseRecipient {
  id: string;
  accountHolderName: string;
  currency: string;
  type: string;
  details: any;
}

interface WiseTransfer {
  id: string;
  targetAccount: string;
  quoteUuid: string;
  status: string;
}

class WiseError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'WiseError';
  }
}

function handleWiseError(error: any): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    const response = axiosError.response;
    
    if (response?.data) {
      throw new WiseError(
        response.data.message || 'Wise API error',
        response.data.code,
        response.data
      );
    }
    
    if (!response) {
      throw new WiseError('Network error: Unable to connect to Wise API');
    }
    
    throw new WiseError(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  throw new WiseError('Unknown error occurred');
}

export class WisePaymentService {
  private readonly api;

  constructor() {
    if (!WISE_API_KEY) {
      throw new WiseError('WISE_API_KEY is not configured');
    }
    if (!WISE_PROFILE_ID) {
      throw new WiseError('WISE_PROFILE_ID is not configured');
    }

    this.api = axios.create({
      baseURL: WISE_API_URL,
      headers: {
        'Authorization': `Bearer ${WISE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async createQuote(amount: number, sourceCurrency: string = 'USD', targetCurrency: string = 'EUR'): Promise<WiseQuote> {
    try {
      const response = await this.api.post('/v3/quotes', {
        profileId: WISE_PROFILE_ID,
        sourceCurrency,
        targetCurrency,
        sourceAmount: amount,
        targetAmount: null,
      });
      return response.data;
    } catch (error) {
      handleWiseError(error);
    }
  }

  async createRecipient(accountHolderName: string, iban: string, currency: string = 'EUR'): Promise<WiseRecipient> {
    try {
      const response = await this.api.post('/v1/accounts', {
        currency,
        type: 'iban',
        profile: WISE_PROFILE_ID,
        accountHolderName,
        details: {
          legalType: 'PRIVATE',
          iban,
        }
      });
      return response.data;
    } catch (error) {
      handleWiseError(error);
    }
  }

  async createTransfer(quoteId: string, targetAccountId: string, reference: string): Promise<WiseTransfer> {
    try {
      const response = await this.api.post('/v1/transfers', {
        targetAccount: targetAccountId,
        quoteUuid: quoteId,
        customerTransactionId: reference,
        details: {
          reference,
          transferPurpose: 'verification',
          sourceOfFunds: 'verification'
        }
      });
      return response.data;
    } catch (error) {
      handleWiseError(error);
    }
  }

  async fundTransfer(transferId: string): Promise<void> {
    try {
      await this.api.post(`/v3/profiles/${WISE_PROFILE_ID}/transfers/${transferId}/payments`, {
        type: 'BALANCE'
      });
    } catch (error) {
      handleWiseError(error);
    }
  }

  async getTransferStatus(transferId: string): Promise<string> {
    try {
      const response = await this.api.get(`/v1/transfers/${transferId}`);
      return response.data.status;
    } catch (error) {
      handleWiseError(error);
    }
  }
}

// Create singleton instance
export const wisePaymentService = new WisePaymentService();
