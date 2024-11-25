'use client'

import React from 'react';
import { useCart } from '@/context/CartContext';
import { CartItem } from '@/types/cart';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const TestComponent: React.FC = () => {
  const { state, addItem, removeItem, getItemCount } = useCart();
  const itemCount = getItemCount();
  const totalPrice = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Test product data
  const testProduct: CartItem = {
    id: 1,
    name: "Test Product",
    price: 29.99,
    quantity: 1
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Shopping Cart Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p>Total Items: {itemCount}</p>
            <p>Total Price: ${totalPrice.toFixed(2)}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => addItem(testProduct)}>
              Add Test Item
            </Button>
            <Button onClick={() => removeItem(testProduct.id)} variant="destructive">
              Remove Test Item
            </Button>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Cart Items:</h3>
            {state.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b">
                <span>{item.name} (x{item.quantity})</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestComponent;