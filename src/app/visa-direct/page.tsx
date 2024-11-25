'use client'

import { Button } from "@/components/ui/button"
import { ArrowRightIcon, GlobeIcon, LockClosedIcon, CardStackIcon, LightningBoltIcon } from '@radix-ui/react-icons'
import VisaDirectAmend from '@/components/AmendingRequestToPay'
import Link from 'next/link'

export default function VisaDirectLanding() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link href="/" className="flex items-center justify-center">
          <CardStackIcon className="h-6 w-6" />
          <span className="ml-2 text-2xl font-bold">Visa Direct</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/features" className="text-sm font-medium hover:underline underline-offset-4">
            Features
          </Link>
          <Link href="/pricing" className="text-sm font-medium hover:underline underline-offset-4">
            Pricing
          </Link>
          <Link href="/about" className="text-sm font-medium hover:underline underline-offset-4">
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:underline underline-offset-4">
            Contact
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Fast, Secure, Global Payments
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Visa Direct enables real-time payments to billions of endpoints worldwide. Simplify your transactions and expand your reach.
                </p>
              </div>
              <div className="space-x-4">
                <Button>Get Started</Button>
                <Button variant="outline">Learn More</Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
                <LightningBoltIcon className="h-8 w-8 mb-2" />
                <h2 className="text-xl font-bold">Instant Transfers</h2>
                <p className="text-center text-gray-500 dark:text-gray-400">Send and receive money in real-time, 24/7/365.</p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
                <GlobeIcon className="h-8 w-8 mb-2" />
                <h2 className="text-xl font-bold">Global Reach</h2>
                <p className="text-center text-gray-500 dark:text-gray-400">Access billions of endpoints across 200+ countries and territories.</p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
                <LockClosedIcon className="h-8 w-8 mb-2" />
                <h2 className="text-xl font-bold">Secure Transactions</h2>
                <p className="text-center text-gray-500 dark:text-gray-400">Benefit from Visa's world-class security and fraud protection.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to get started?</h2>
                <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Join thousands of businesses already using Visa Direct to power their payments.
                </p>
              </div>
              <Button className="inline-flex items-center justify-center">
                Create an Account <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <VisaDirectAmend />
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400"> 2024 Visa Direct. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="/terms" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}