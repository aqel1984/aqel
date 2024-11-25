'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { paymentService } from '@/lib/services/payment';
import { useCart } from '@/context/CartContext';

interface PaymentOptionsProps {
  onSuccess?: (paymentMethod: string, transactionId: string) => void;
  onError?: (error: Error) => void;
}

export function PaymentOptions({ onSuccess, onError }: PaymentOptionsProps) {
  const { state: cartState } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [recipientCard, setRecipientCard] = useState({
    number: '',
    expiryMonth: '',
    expiryYear: '',
    recipientName: '',
  });

  // Calculate total amount from cart
  const totalAmount = cartState.items.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Handle Apple Pay
  const handleApplePay = async () => {
    try {
      setLoading(true);
      const response = await paymentService.createApplePayLink({
        amount: totalAmount,
        currency: 'USD',
        email: '', // You'll need to get this from your user context or form
        name: '', // You'll need to get this from your user context or form
        description: 'Purchase from Aqel Jehad Ltd',
      });

      // Open Apple Pay link in new window
      window.open(response.paymentLink, '_blank');
      onSuccess?.('apple_pay', response.paymentIntent);
    } catch (error) {
      console.error('Apple Pay error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create Apple Pay link. Please try again.',
        variant: 'destructive',
      });
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Visa Direct
  const handleVisaDirect = async () => {
    try {
      setLoading(true);
      const response = await paymentService.processVisaDirectPayment({
        amount: totalAmount,
        currency: 'USD',
        email: '', // You'll need to get this from your user context or form
        name: recipientCard.recipientName,
        description: 'Purchase from Aqel Jehad Ltd',
        recipientCard,
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Payment processed successfully!',
        });
        onSuccess?.('visa_direct', response.transactionId);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Visa Direct error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process Visa Direct payment. Please try again.',
        variant: 'destructive',
      });
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Payment Options</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Total Amount: ${totalAmount.toFixed(2)}
        </p>
      </div>

      {/* Apple Pay */}
      <div>
        <Button
          onClick={handleApplePay}
          disabled={loading}
          className="w-full bg-black text-white hover:bg-gray-800"
        >
          Pay with Apple Pay
        </Button>
      </div>

      {/* Visa Direct */}
      <div className="space-y-4">
        <h3 className="text-md font-medium">Pay with Visa Direct</h3>
        
        <div className="space-y-2">
          <Label htmlFor="cardNumber">Card Number</Label>
          <Input
            id="cardNumber"
            value={recipientCard.number}
            onChange={(e) => setRecipientCard(prev => ({ ...prev, number: e.target.value }))}
            placeholder="4111 1111 1111 1111"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiryMonth">Expiry Month</Label>
            <Input
              id="expiryMonth"
              value={recipientCard.expiryMonth}
              onChange={(e) => setRecipientCard(prev => ({ ...prev, expiryMonth: e.target.value }))}
              placeholder="MM"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiryYear">Expiry Year</Label>
            <Input
              id="expiryYear"
              value={recipientCard.expiryYear}
              onChange={(e) => setRecipientCard(prev => ({ ...prev, expiryYear: e.target.value }))}
              placeholder="YYYY"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipientName">Recipient Name</Label>
          <Input
            id="recipientName"
            value={recipientCard.recipientName}
            onChange={(e) => setRecipientCard(prev => ({ ...prev, recipientName: e.target.value }))}
            placeholder="John Doe"
          />
        </div>

        <Button
          onClick={handleVisaDirect}
          disabled={loading}
          className="w-full"
        >
          Pay with Visa Direct
        </Button>
      </div>
    </div>
  );
}
