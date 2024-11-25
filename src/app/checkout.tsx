'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApplePayButton } from '@/components/ApplePayButton';
import { useToast } from '@/hooks/useToast';
import type { ApplePayJS } from '@/types/apple-pay';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CheckoutPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async (token: ApplePayJS.ApplePayPaymentToken) => {
    try {
      setIsProcessing(true);
      
      // Process the payment result
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error('Failed to process payment');
      }

      const data = await response.json();

      addToast({
        title: "Success",
        description: "Payment processed successfully",
        variant: 'success'
      });

      // Redirect to success page
      router.push(`/payment/success?orderId=${data.orderId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      setError(errorMessage);
      addToast({
        title: "Error",
        description: errorMessage,
        variant: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleError = (error: Error) => {
    setError(error.message);
    addToast({
      title: "Error",
      description: error.message,
      variant: 'error'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>
            Complete your purchase using Apple Pay
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isProcessing ? (
            <div className="flex items-center justify-center p-4">
              <Spinner className="mr-2" />
              <span>Processing payment...</span>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <p className="text-lg font-semibold">Total Amount: £99.99</p>
              </div>
              <ApplePayButton
                amount={99.99}
                description="Order Total"
                currency="GBP"
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}