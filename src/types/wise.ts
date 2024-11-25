export interface WiseTransferResource {
  id: string;
  type: string;
  state: string;
  created_at: string;
  updated_at: string;
}

export interface WiseWebhookData {
  resource: WiseTransferResource;
  current_state: string;
  previous_state?: string;
  occurred_at: string;
}

export interface WiseWebhookEvent {
  event_type: string;
  data: WiseWebhookData;
  timestamp: string;
  subscription_id: string;
  version: string;
}

export interface WiseTransferDetails {
  id: string;
  targetAccount: string;
  sourceAccount: string;
  quote: {
    id: string;
    sourceCurrency: string;
    targetCurrency: string;
    sourceAmount: number;
    targetAmount: number;
    rate: number;
    fee: number;
    createdAt: string;
    expiresAt: string;
  };
  customerTransactionId?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface WiseRefundRequest {
  transferId: string;
  refundReason: string;
  amount?: {
    currency: string;
    value: number;
  };
}

export interface WiseRefundResponse {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  transferId: string;
  amount: {
    currency: string;
    value: number;
  };
}
