'use client'

import React from 'react'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from './ThemeProvider'
import { CartProvider } from '@/context/CartContext'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    // Wrap the entire application with SessionProvider for authentication
    <SessionProvider>
      {/* ThemeProvider for managing light/dark mode */}
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {/* CartProvider for managing the shopping cart state */}
        <CartProvider>
          {children}
        </CartProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}