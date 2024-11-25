'use client'

import React from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

interface CartButtonProps {
  onClick?: () => void;
  className?: string;
}

export function CartButton({ onClick, className }: CartButtonProps) {
  const { state } = useCart();
  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn('relative', className)}
      onClick={onClick}
    >
      <ShoppingCartIcon className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-blue-600 text-xs text-white flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Button>
  );
}
