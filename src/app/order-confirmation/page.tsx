import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Confirmation - Aqel Jehad Ltd',
  description: 'Thank you for your order with Aqel Jehad Ltd. View your order confirmation details.',
}

export default function OrderConfirmationPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Thank You for Your Order!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-8 text-muted-foreground">Your order has been received and is being processed. We&apos;ll send you an email with the order details and tracking information once it&apos;s shipped.</p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}