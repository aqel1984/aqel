'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

declare global {
  interface Window {
    ApplePaySession: ApplePaySessionConstructor;
  }
}

function ApplePayContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('initializing');
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        if (!searchParams) {
          throw new Error('Missing payment parameters');
        }

        const amount = parseFloat(searchParams.get('amount') || '0');
        const currency = searchParams.get('currency') || 'USD';
        const description = searchParams.get('description') || 'Payment';

        if (!amount) {
          throw new Error('Missing required payment information');
        }

        // Check if Apple Pay is available
        if (!window.ApplePaySession || !window.ApplePaySession.canMakePayments()) {
          throw new Error('Apple Pay is not available on this device');
        }

        // Configure the payment request
        const paymentRequest = {
          countryCode: 'US',
          currencyCode: currency,
          merchantCapabilities: ['supports3DS'],
          supportedNetworks: ['visa', 'masterCard', 'amex'],
          total: {
            label: description,
            amount: amount.toFixed(2),
            type: 'final'
          }
        };

        // Create and begin Apple Pay session
        const session = new window.ApplePaySession(3, paymentRequest);

        session.onvalidatemerchant = (event: any) => {
          setStatus('Validating merchant...');
          fetch('/api/payments/apple-pay/validate-merchant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ validationURL: event.validationURL })
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Merchant validation failed');
            }
            return response.json();
          })
          .then(merchantSession => {
            session.completeMerchantValidation(merchantSession);
            setStatus('Merchant validated successfully');
          })
          .catch(err => {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError('Merchant validation failed: ' + errorMessage);
            session.abort();
          });
        };

        session.onpaymentauthorized = (event: any) => {
          setStatus('Processing payment...');
          fetch('/api/payments/apple-pay/process-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payment: event.payment })
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Payment processing failed');
            }
            return response.json();
          })
          .then(result => {
            if (result.success) {
              session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
              setStatus('Payment completed successfully');
              setPaymentData(result);
            } else {
              throw new Error(result.error || 'Payment processing failed');
            }
          })
          .catch(err => {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError('Payment failed: ' + errorMessage);
            session.completePayment(window.ApplePaySession.STATUS_FAILURE);
          });
        };

        session.oncancel = () => {
          setStatus('Payment cancelled by user');
        };

        session.begin();
        setStatus('Apple Pay session started');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError('Failed to start Apple Pay: ' + errorMessage);
        setStatus('error');
      }
    };

    initializePayment();
  }, [searchParams]);

  if (error) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-red-500">Payment Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.close()}>Close Window</Button>
        </CardContent>
      </Card>
    );
  }

  if (status === 'completed' && paymentData) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-green-500">Payment Successful</CardTitle>
          <CardDescription>Your payment has been processed successfully.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>Transaction ID: {paymentData.transactionId}</p>
            <Button onClick={() => window.close()}>Close Window</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'cancelled') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Payment Cancelled</CardTitle>
          <CardDescription>You have cancelled the payment.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.close()}>Close Window</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Processing Payment</CardTitle>
        <CardDescription>Please complete the payment using Apple Pay...</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Spinner className="w-8 h-8" />
      </CardContent>
    </Card>
  );
}

export default function ApplePayPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Loading</CardTitle>
            <CardDescription>Please wait...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Spinner className="w-8 h-8" />
          </CardContent>
        </Card>
      }>
        <ApplePayContent />
      </Suspense>
    </div>
  );
}
