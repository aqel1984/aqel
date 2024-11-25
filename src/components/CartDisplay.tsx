import React from 'react';

interface CartDisplayProps {
  className?: string;
}

export const CartDisplay: React.FC<CartDisplayProps> = ({ className = '' }) => {
  return (
    <div className={`cart-display ${className}`}>
      {/* Cart display implementation will go here */}
      <div className="p-4 border rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Shopping Cart</h2>
        <div className="space-y-2">
          {/* Cart items will be rendered here */}
          <p className="text-gray-500">Your cart is empty</p>
        </div>
      </div>
    </div>
  );
};

export default CartDisplay;