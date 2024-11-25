import * as React from "react";
import { MinusCircleIcon, PlusCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/context/CartContext";
import { type CartItem } from "@/types/cart";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Cart({ isOpen, onClose }: CartProps) {
  const { state, removeItem, dispatch } = useCart();
  const cartItems = state.items;
  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const updateQuantity = (itemId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {cartItems.length === 0 ? (
            <p className="text-center text-gray-500">Your cart is empty</p>
          ) : (
            <>
              {cartItems.map((item: CartItem) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between space-x-4"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, Math.max(0, item.quantity - 1))
                      }
                      className="p-1 hover:bg-gray-100 rounded-full"
                      aria-label="Decrease quantity"
                    >
                      <MinusCircleIcon className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className="p-1 hover:bg-gray-100 rounded-full"
                      aria-label="Increase quantity"
                    >
                      <PlusCircleIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 hover:bg-gray-100 rounded-full text-red-500"
                      aria-label="Remove item"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}