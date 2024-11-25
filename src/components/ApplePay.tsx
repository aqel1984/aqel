'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

// ApplePay types
type SupportedNetworks = 'visa' | 'masterCard' | 'amex';
type MerchantCapabilities = 'supports3DS';

interface ApplePayPaymentRequest {
  countryCode: string;
  currencyCode: string;
  supportedNetworks: readonly SupportedNetworks[];
  merchantCapabilities: readonly MerchantCapabilities[];
  total: {
    label: string;
    amount: string;
    type: 'final';
  };
}

interface ApplePayMerchantEvent {
  validationURL: string;
}

interface ApplePayPaymentEvent {
  payment: {
    token: {
      paymentData: any;
      paymentMethod: {
        displayName: string;
        network: string;
        type: string;
      };
      transactionIdentifier: string;
    };
    billingContact?: {
      addressLines?: string[];
      locality?: string;
      postalCode?: string;
      country?: string;
      countryCode?: string;
      emailAddress?: string;
      familyName?: string;
      givenName?: string;
      phoneNumber?: string;
    };
    shippingContact?: {
      addressLines?: string[];
      locality?: string;
      postalCode?: string;
      country?: string;
      countryCode?: string;
      emailAddress?: string;
      familyName?: string;
      givenName?: string;
      phoneNumber?: string;
    };
  };
}

interface ApplePayProps {
  amount: number;
  currency?: string;
  merchantId?: string;
  merchantName?: string;
  onSuccess?: (token: ApplePayPaymentEvent['payment']) => void;
  onError?: (error: Error) => void;
}

export default function ApplePay({
  amount,
  currency = 'USD',
  merchantId = process.env['NEXT_PUBLIC_APPLE_PAY_MERCHANT_ID'] || '',
  merchantName = process.env['NEXT_PUBLIC_APPLE_PAY_MERCHANT_NAME'] || 'Your Store',
  onSuccess,
  onError,
}: ApplePayProps) {
  const { toast } = useToast();
  const [isAvailable, setIsAvailable] = React.useState(false);

  React.useEffect(() => {
    // Check if Apple Pay is available
    const checkApplePayAvailability = async () => {
      try {
        if (window.ApplePaySession?.canMakePayments()) {
          setIsAvailable(true);
        } else {
          setIsAvailable(false);
        }
      } catch (error) {
        console.error('Error checking Apple Pay availability:', error);
        setIsAvailable(false);
      }
    };

    checkApplePayAvailability();
  }, []);

  const handlePayment = async () => {
    try {
      const ApplePaySession = window.ApplePaySession;
      if (!ApplePaySession) {
        throw new Error('Apple Pay is not available');
      }

      const paymentRequest: ApplePayPaymentRequest = {
        countryCode: 'US',
        currencyCode: currency,
        supportedNetworks: ['visa', 'masterCard', 'amex'],
        merchantCapabilities: ['supports3DS'],
        total: {
          label: merchantName,
          amount: amount.toFixed(2),
          type: 'final',
        },
      };

      const session = new ApplePaySession(3, paymentRequest);

      session.onvalidatemerchant = async (event: ApplePayMerchantEvent) => {
        try {
          const response = await fetch('/api/apple-pay/validate-merchant', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              validationURL: event.validationURL,
              merchantId,
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
          onError?.(error instanceof Error ? error : new Error('Merchant validation failed'));
        }
      };

      session.onpaymentauthorized = async (event: ApplePayPaymentEvent) => {
        try {
          onSuccess?.(event.payment);
          session.completePayment(ApplePaySession.STATUS_SUCCESS);
          
          toast({
            title: 'Payment Successful',
            description: 'Your Apple Pay payment was processed successfully.',
          });
        } catch (error) {
          console.error('Payment authorization error:', error);
          session.completePayment(ApplePaySession.STATUS_FAILURE);
          onError?.(error instanceof Error ? error : new Error('Payment authorization failed'));
          
          toast({
            title: 'Payment Failed',
            description: 'There was an error processing your Apple Pay payment.',
            variant: 'destructive',
          });
        }
      };

      session.begin();
    } catch (error) {
      console.error('Apple Pay error:', error);
      onError?.(error instanceof Error ? error : new Error('Apple Pay session failed'));
      
      toast({
        title: 'Error',
        description: 'Failed to initialize Apple Pay. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!isAvailable) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          Apple Pay is not available. Please make sure you're using a supported device and browser.
        </p>
      </div>
    );
  }

  return (
    <Button
      onClick={handlePayment}
      className="w-full flex items-center justify-center space-x-2"
    >
      <span>Pay with</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5"
      >
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
      </svg>
    </Button>
  );
}