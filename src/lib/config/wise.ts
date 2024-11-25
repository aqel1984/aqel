export const WiseConfig = {
  apiKey: process.env['WISE_API_KEY'],
  profileId: process.env['WISE_PROFILE_ID'],
  webhookUrl: process.env['WISE_WEBHOOK_URL'],
  webhookPublicKey: process.env['WISE_WEBHOOK_PUBLIC_KEY'],
  apiUrl: 'https://api.wise.com',
  sandboxApiUrl: 'https://api.sandbox.wise.com',
  // Use sandbox for development, production for live
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.wise.com'
    : 'https://api.sandbox.wise.com',
} as const;

// Wise API endpoints
export const WiseEndpoints = {
  quotes: '/v3/quotes',
  transfers: '/v1/transfers',
  profiles: '/v1/profiles',
  accounts: '/v1/accounts',
  rates: '/v1/rates',
  webhooks: {
    deliveryDetails: '/v1/webhook-deliveries',
    subscriptions: '/v1/webhook-subscriptions',
  },
} as const;

// Wise webhook event types
export const WiseWebhookEvents = {
  TRANSFER_STATE_CHANGE: 'transfer-state-change',
  BALANCE_DEPOSIT: 'balance-deposit',
  TRANSFER_ISSUE: 'transfer-issue',
} as const;

// Wise transfer states
export const WiseTransferStates = {
  INCOMING_PAYMENT_WAITING: 'incoming_payment_waiting',
  INCOMING_PAYMENT_INITIATED: 'incoming_payment_initiated',
  INCOMING_PAYMENT_FINISHED: 'incoming_payment_finished',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
} as const;

// Map Wise states to our payment states
export const WiseStateMap: Record<string, 'pending' | 'completed' | 'failed' | 'refunded'> = {
  [WiseTransferStates.INCOMING_PAYMENT_WAITING]: 'pending',
  [WiseTransferStates.INCOMING_PAYMENT_INITIATED]: 'pending',
  [WiseTransferStates.INCOMING_PAYMENT_FINISHED]: 'completed',
  [WiseTransferStates.REFUNDED]: 'refunded',
  [WiseTransferStates.CANCELLED]: 'failed',
  [WiseTransferStates.FAILED]: 'failed',
} as const;
