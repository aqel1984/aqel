'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApplePayButton } from '@/components/ApplePayButton';
import { useToast } from '@/components/ui/use-toast';
import type { ApplePayJS } from '@/types/apple-pay';

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

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

      toast({
        title: "Success",
        description: "Payment processed successfully",
      });

      // Redirect to success page
      router.push(`/payment/success?orderId=${data.orderId}`);
    } catch (error) {
      console.error('Payment processing failed:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Payment processing failed',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleError = (error: Error) => {
    console.error('Payment failed:', error);
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <div className="max-w-md mx-auto">
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
            <div className="flex justify-between mb-4">
              <span>Total</span>
              <span className="font-semibold">£99.99</span>
            </div>
            {!isProcessing && (
              <ApplePayButton
                amount={99.99}
                description="Order Total"
                currency="GBP"
                onSuccess={handleSuccess}
                onError={handleError}
              />
            )}
            {isProcessing && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2">Processing payment...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}