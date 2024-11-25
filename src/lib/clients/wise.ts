interface WiseClientConfig {
  apiKey: string;
  profileId: string;
  baseUrl?: string;
}

interface WiseTransfer {
  id: string;
  sourceAmount: number;
  sourceCurrency: string;
  targetAmount: number;
  targetCurrency: string;
  status: string;
  customerTransactionId: string;
}

interface WiseQuote {
  id: string;
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: number;
  targetAmount: number;
  rate: number;
  expirationTime: string;
}

interface WiseRefund {
  id: string;
  transferId: string;
  amount: number;
  currency: string;
  status: string;
  reason: string;
  createdAt: string;
}

interface CreateQuoteParams {
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: number;
}

interface CreateTransferParams {
  targetAccount: string;
  quoteId: string;
  customerTransactionId: string;
  details: {
    reference: string;
    transferPurpose: string;
    sourceOfFunds: string;
  };
}

interface CreateRefundParams {
  transferId: string;
  amount: number;
  currency: string;
  reason: string;
}

export class WiseClient {
  private readonly apiKey: string;
  private readonly profileId: string;
  private readonly baseUrl: string;

  constructor(config: WiseClientConfig) {
    this.apiKey = config.apiKey;
    this.profileId = config.profileId;
    this.baseUrl = config.baseUrl || 'https://api.wise.com';
  }

  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
      }

      return response.json();
    } catch (error) {
      console.error('Wise API request failed:', error);
      throw error;
    }
  }

  async createQuote(params: CreateQuoteParams): Promise<WiseQuote> {
    return this.request<WiseQuote>(
      'POST',
      `/v3/profiles/${this.profileId}/quotes`,
      {
        sourceCurrency: params.sourceCurrency,
        targetCurrency: params.targetCurrency,
        sourceAmount: params.sourceAmount,
      }
    );
  }

  async createTransfer(params: CreateTransferParams): Promise<WiseTransfer> {
    return this.request<WiseTransfer>(
      'POST',
      `/v1/transfers`,
      {
        targetAccount: params.targetAccount,
        quoteUuid: params.quoteId,
        customerTransactionId: params.customerTransactionId,
        details: params.details,
      }
    );
  }

  async getTransfer(transferId: string): Promise<WiseTransfer> {
    return this.request<WiseTransfer>(
      'GET',
      `/v1/transfers/${transferId}`
    );
  }

  async createRefund(params: CreateRefundParams): Promise<WiseRefund> {
    return this.request<WiseRefund>(
      'POST',
      `/v3/profiles/${this.profileId}/transfers/${params.transferId}/refunds`,
      {
        refundAmount: params.amount,
        currency: params.currency,
        reason: params.reason,
      }
    );
  }

  async getRefund(refundId: string): Promise<WiseRefund> {
    return this.request<WiseRefund>(
      'GET',
      `/v3/refunds/${refundId}`
    );
  }

  async listRefunds(transferId: string): Promise<WiseRefund[]> {
    return this.request<WiseRefund[]>(
      'GET',
      `/v3/profiles/${this.profileId}/transfers/${transferId}/refunds`
    );
  }
}
