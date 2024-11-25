import '@/styles/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDisplay } from '@/components/CartDisplay'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Aqel Jehad Ltd - Premium Raw Materials',
  description: 'Your trusted partner in high-quality raw materials, specializing in shea butter and cocoa butter.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Aqel Jehad Ltd - Premium Raw Materials',
    description: 'Your trusted partner in high-quality raw materials, specializing in shea butter and cocoa butter.',
    type: 'website',
    url: 'https://www.aqeljehad-ltd.com',
    images: [
      {
        url: 'https://www.aqeljehad-ltd.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Aqel Jehad Ltd',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} flex flex-col min-h-screen bg-background text-foreground`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8" aria-label="Main content">
              {children}
            </main>
            <Footer />
            <CartDisplay />
          </div>
        </Providers>
      </body>
    </html>
  )
}