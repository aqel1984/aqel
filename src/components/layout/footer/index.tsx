'use client'

import React from 'react'
import Link from 'next/link'
import { MoonIcon, SunIcon, ShoppingCartIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { create } from 'zustand'

interface CartItem {
  id: string
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
}

const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({ items: state.items.filter(item => item.id !== id) })),
}))

export function Header() {
  const { theme, setTheme } = useTheme()
  const cartItems = useCartStore((state) => state.items)

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          My Store
        </Link>
        <nav>
          <ul className="flex space-x-4">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-foreground hover:text-primary transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>
          <Button variant="outline" size="icon" aria-label={`Cart with ${cartItems.length} items`}>
            <ShoppingCartIcon className="h-5 w-5" />
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