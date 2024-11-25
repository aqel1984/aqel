import React from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDisplay } from '@/components/CartDisplay'
import { Providers } from '@/components/Providers'
import { Toaster } from '@/components/ui/toaster'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <Providers>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </div>
      <CartDisplay />
      <Toaster />
    </Providers>
  )
}