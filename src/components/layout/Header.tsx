import React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useCart } from '@/context/CartContext';
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon, ShoppingCartIcon } from 'lucide-react';

export const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { state } = useCart();
  const cartItems = state.items || []; // Use state.items instead of state.cartItems

  const totalItems = cartItems.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);

  return (
    <header className="bg-background shadow-sm">
      <nav aria-label="Top" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex w-full items-center justify-between border-b border-muted py-6">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              My Store
            </Link>
            <div className="ml-10 hidden space-x-8 lg:block">
              <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Home
              </Link>
              <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Products
              </Link>
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Login
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" data-testid="sun-icon" />
              ) : (
                <MoonIcon className="h-5 w-5" data-testid="moon-icon" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="ml-4 relative"
              aria-label="Shopping cart"
            >
              <ShoppingCartIcon className="h-5 w-5" data-testid="cart-icon" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;