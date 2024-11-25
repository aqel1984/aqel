import axios, { AxiosInstance } from 'axios';
import { config } from './config';

export interface PaymentData {
  amount: number;
  currency: string;
  senderAccountNumber: string;
  recipientAccountNumber: string;
  // Add other necessary fields
}

export interface AmendData {
  originalTransactionId: string;
  newAmount: number;
  // Add other necessary fields
}

export interface VisaDirectResponse {
  transactionId: string;
  status: string;
  // Add other fields that Visa Direct API returns
}

const visaDirectClient: AxiosInstance = axios.create({
  baseURL: config.visa.apiUrl,
  headers: {
    'Authorization': `Basic ${Buffer.from(`${config.visa.apiKey}:${config.visa.apiSecret}`).toString('base64')}`,
    'Content-Type': 'application/json'
  }
});

export const initiatePayment = async (paymentData: PaymentData): Promise<VisaDirectResponse> => {
  try {
    const response = await visaDirectClient.post('/visadirect/fundstransfer/v1/pushfundstransactions', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error initiating Visa Direct payment:', error);
    throw new Error('Failed to initiate Visa Direct payment');
  }
};

export const amendRequestToPay = async (amendData: AmendData): Promise<VisaDirectResponse> => {
  try {
    const response = await visaDirectClient.post('/visadirect/requesttopay/v1/amend', amendData);
    return response.data;
  } catch (error) {
    console.error('Error amending Request to Pay:', error);
    throw new Error('Failed to amend Request to Pay');
  }
};

export default visaDirectClient;