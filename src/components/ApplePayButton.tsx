'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { ApplePayJS } from '@/types/apple-pay';

interface ApplePayButtonProps {
  amount: number;
  description: string;
  currency: string;
  onSuccess: (response: ApplePayJS.ApplePayPaymentToken) => void;
  onError: (error: Error) => void;
}

export function ApplePayButton({
  amount,
  description,
  currency,
  onSuccess,
  onError
}: ApplePayButtonProps) {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ApplePaySession) {
      setIsAvailable(window.ApplePaySession.canMakePayments());
    }
  }, []);

  const handlePaymentClick = useCallback(async () => {
    try {
      if (!window.ApplePaySession) {
        throw new Error('Apple Pay is not available');
      }

      const paymentRequest: ApplePayJS.ApplePayPaymentRequest = {
        countryCode: 'GB',
        currencyCode: currency,
        supportedNetworks: ['visa', 'masterCard', 'amex'],
        merchantCapabilities: ['supports3DS'],
        total: {
          label: description,
          amount: amount.toFixed(2),
          type: 'final'
        }
      };

      const session = new window.ApplePaySession(3, paymentRequest);

      session.onvalidatemerchant = async (event) => {
        try {
          const response = await fetch('/api/validate-merchant', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              validationURL: event.validationURL
            }),
          });

          if (!response.ok) {
            throw new Error('Merchant validation failed');
          }

          const merchantSession = await response.json();
          session.completeMerchantValidation(merchantSession);
        } catch (error) {
          console.error('Merchant validation error:', error);
          session.abort();
          onError(error instanceof Error ? error : new Error('Merchant validation failed'));
        }
      };

      session.onpaymentauthorized = (event) => {
        try {
          onSuccess(event.payment.token);
          session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
        } catch (error) {
          console.error('Payment processing error:', error);
          session.completePayment(window.ApplePaySession.STATUS_FAILURE);
          onError(error instanceof Error ? error : new Error('Payment processing failed'));
        }
      };

      session.oncancel = () => {
        console.log('Payment cancelled');
        onError(new Error('Payment was cancelled'));
      };

      session.begin();
    } catch (error) {
      console.error('Apple Pay error:', error);
      onError(error instanceof Error ? error : new Error('Apple Pay initialization failed'));
    }
  }, [amount, currency, description, onSuccess, onError]);

  if (!isAvailable) {
    return null;
  }

  return (
    <Button
      onClick={handlePaymentClick}
      className="apple-pay-button"
      aria-label="Pay with Apple Pay"
    >
      Pay with Apple Pay
    </Button>
  );
}