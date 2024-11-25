'use client';

import { useState } from 'react';
import type { ApplePayJS } from '@/types/apple-pay';

export default function ApplePayTest() {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const startApplePaySession = async () => {
    try {
      setStatus('Starting Apple Pay session...');
      setError('');

      // Check if Apple Pay is available
      if (!window.ApplePaySession || !window.ApplePaySession.canMakePayments()) {
        throw new Error('Apple Pay is not available on this device');
      }

      // Create payment request
      const response = await fetch('/api/payments/apple-pay/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 10.99 }) // Test amount
      });

      const sessionData = await response.json();
      if (!sessionData.success) {
        throw new Error(sessionData.error || 'Failed to create session');
      }

      // Initialize Apple Pay session
      const session = new window.ApplePaySession(3, sessionData.paymentRequest);

      // Handle merchant validation
      session.onvalidatemerchant = (event: ApplePayJS.ValidateMerchantEvent) => {
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

      // Handle payment authorization
      session.onpaymentauthorized = (event: ApplePayJS.PaymentAuthorizedEvent) => {
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

      // Handle cancellation
      session.oncancel = () => {
        setStatus('Payment cancelled by user');
      };

      // Begin session
      session.begin();
      setStatus('Apple Pay session started');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError('Failed to start Apple Pay: ' + errorMessage);
      setStatus('');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Apple Pay Test</h1>
      
      <button
        onClick={startApplePaySession}
        className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
      >
        Pay with Apple Pay
      </button>

      {status && (
        <div className="mt-4 p-4 bg-blue-100 text-blue-700 rounded-md">
          {status}
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}
