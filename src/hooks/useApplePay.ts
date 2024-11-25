import { useState, useEffect, useCallback } from 'react';
import ApplePaySessionMock from '../__mocks__/ApplePaySessionMock';
import type { ApplePayJS } from '@/types/apple-pay';

interface UseApplePayProps {
  amount: number;
  currency: string;
  onPaymentComplete?: (result: ApplePayJS.ApplePayPaymentToken) => void;
  onPaymentError?: (error: Error) => void;
}

interface UseApplePayReturn {
  isAvailable: boolean;
  isLoading: boolean;
  error: string | null;
  initiatePayment: () => Promise<void>;
}

export function useApplePay({
  amount,
  currency,
  onPaymentComplete,
  onPaymentError
}: UseApplePayProps): UseApplePayReturn {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ApplePaySessionClass = window.ApplePaySession || ApplePaySessionMock;
    setIsAvailable(!!ApplePaySessionClass && ApplePaySessionClass.canMakePayments());
  }, []);

  const handleError = useCallback((error: unknown, fallbackMessage: string): void => {
    const errorMessage = error instanceof Error ? error.message : fallbackMessage;
    setError(errorMessage);
    onPaymentError?.(error instanceof Error ? error : new Error(errorMessage));
  }, [onPaymentError]);

  const initiatePayment = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const paymentRequest: ApplePayJS.ApplePayPaymentRequest = {
        countryCode: 'US',
        currencyCode: currency,
        supportedNetworks: ['visa', 'masterCard', 'amex'],
        merchantCapabilities: ['supports3DS'],
        total: {
          label: 'Total',
          amount: amount.toString(),
          type: 'final'
        }
      };

      const ApplePaySessionClass = window.ApplePaySession || ApplePaySessionMock;
      const session = new ApplePaySessionClass(3, paymentRequest);

      session.onvalidatemerchant = async (event: { validationURL: string }) => {
        try {
          const response = await fetch('/api/apple-pay/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ validationUrl: event.validationURL }),
          });

          if (!response.ok) {
            throw new Error('Failed to validate merchant');
          }

          const merchantSession = await response.json();
          session.completeMerchantValidation(merchantSession);
        } catch (error) {
          console.error('Merchant validation failed:', error);
          session.abort();
          onPaymentError?.(error as Error);
        }
      };

      session.onpaymentauthorized = async (event: { payment: ApplePayJS.ApplePayPaymentToken }) => {
        try {
          const response = await fetch('/api/apple-pay/process-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event.payment),
          });

          if (!response.ok) {
            throw new Error('Payment processing failed');
          }

          session.completePayment(0); // STATUS_SUCCESS
          onPaymentComplete?.(event.payment);
        } catch (error) {
          console.error('Payment processing failed:', error);
          session.completePayment(1); // STATUS_FAILURE
          onPaymentError?.(error as Error);
        }
      };

      session.oncancel = () => {
        console.log('Apple Pay payment cancelled');
      };

      session.begin();
    } catch (error) {
      handleError(error, 'Error creating Apple Pay session');
    } finally {
      setIsLoading(false);
    }
  }, [amount, currency, handleError, onPaymentComplete, onPaymentError]);

  return {
    isAvailable,
    isLoading,
    error,
    initiatePayment
  };
}