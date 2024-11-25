import axios from 'axios';
import { config } from './config';

const WISE_API_URL = 'https://api.wise.com';

if (!config.wise.apiKey) {
  throw new Error('Wise API Key is missing');
}

if (!config.wise.profileId) {
  throw new Error('Wise Profile ID is missing');
}

const wiseApi = axios.create({
  baseURL: WISE_API_URL,
  headers: {
    'Authorization': `Bearer ${config.wise.apiKey}`,
    'Content-Type': 'application/json'
  }
});

export const businessInfo = {
  name: 'Aqel Jehad Ltd',
  membershipNumber: 'P75993157',
  companyType: 'Limited',
  registrationNumber: '15910285',
  category: 'Health, sports or personal care',
  subcategory: 'Beauty products and services',
  description: 'West Africa products like shea butter and cocoa butter',
  size: '11-50',
  registeredAddress: {
    country: 'United Kingdom',
    address: '85 Great Portland Street, First Floor',
    city: 'London',
    postcode: 'W1W 7LT'
  },
  tradingAddress: {
    country: 'United States',
    address: '1207 E Forrest street suite D pmb 1006',
    city: 'Athens',
    state: 'Georgia',
    zipCode: '35613'
  }
};

export async function createQuote(sourceCurrency: string, targetCurrency: string, sourceAmount: number) {
  try {
    const response = await wiseApi.post('/v3/quotes', {
      sourceCurrency,
      targetCurrency,
      sourceAmount,
      profile: config.wise.profileId
    });
    return response.data;
  } catch (error) {
    console.error('Error creating quote:', error);
    throw new Error('Failed to create quote');
  }
}

export async function createRecipient(currency: string, email: string, name: string) {
  try {
    const response = await wiseApi.post('/v1/accounts', {
      currency,
      type: 'email',
      profile: config.wise.profileId,
      accountHolderName: name,
      details: {
        email
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating recipient:', error);
    throw new Error('Failed to create recipient');
  }
}

export async function createTransfer(targetAccountId: string, quoteId: string, customerTransactionId: string, details: unknown) {
  try {
    const response = await wiseApi.post('/v1/transfers', {
      targetAccount: targetAccountId,
      quoteUuid: quoteId,
      customerTransactionId,
      details
    });
    return response.data;
  } catch (error) {
    console.error('Error creating transfer:', error);
    throw new Error('Failed to create transfer');
  }
}

export async function fundTransfer(transferId: number) {
  try {
    const response = await wiseApi.post(`/v3/profiles/${config.wise.profileId}/transfers/${transferId}/payments`, {
      type: 'BALANCE'
    });
    return response.data;
  } catch (error) {
    console.error('Error funding transfer:', error);
    throw new Error('Failed to fund transfer');
  }
}

export async function getBusinessProfile() {
  try {
    const response = await wiseApi.get(`/v1/profiles/${config.wise.profileId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting business profile:', error);
    throw new Error('Failed to get business profile');
  }
}

export async function createPaymentLink(amount: number, currency: string, description: string) {
  try {
    const response = await wiseApi.post('/v3/payment-links', {
      amount: {
        value: amount,
        currency: currency
      },
      description: description,
      profileId: config.wise.profileId
    });
    return response.data;
  } catch (error) {
    console.error('Error creating payment link:', error);
    throw new Error('Failed to create payment link');
  }
}