'use client'

import React from 'react'
import Link from 'next/link'
import { MoonIcon, SunIcon, ShoppingCartIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { create } from 'zustand'

// Define the CartStore type
interface CartStore {
  items: { id: string; quantity: number }[]
  addItem: (item: { id: string; quantity: number }) => void
  removeItem: (id: string) => void
}

// Create the useCartStore hook
const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({ items: state.items.filter(item => item.id !== id) })),
}))

export function Header() {
  const { theme, setTheme } = useTheme()
  const cartItems = useCartStore((state) => state.items)

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          My Store
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="text-foreground hover:text-primary">
                Home
              </Link>
            </li>
            <li>
              <Link href="/products" className="text-foreground hover:text-primary">
                Products
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-foreground hover:text-primary">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-foreground hover:text-primary">
                Contact
              </Link>
            </li>
          </ul>
        </nav>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button variant="outline" size="icon">
            <ShoppingCartIcon className="h-5 w-5" />
            <span className="sr-only">Cart</span>
            {cartItems.length > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}