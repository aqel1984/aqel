'use client'

import React from 'react'
import { SessionProvider } from 'next-auth/react'

interface ClientProvidersProps {
  children: React.ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}