import { NextResponse } from 'next/server';
import { createPaymentLink } from '@/lib/wise';
import { sendInvoiceEmail } from '@/lib/services/email';

export async function POST(request: Request) {
  try {
    const { amount, recipientName, email } = await request.json();

    // Generate a unique description for the payment
    const description = `Payment to ${recipientName}`;

    // Create a payment link
    const paymentLink = await createPaymentLink(amount, 'USD', description) as { url: string };

    // Send the payment link via email
    await sendInvoiceEmail({
      to: email,
      amount,
      currency: 'USD',
      invoiceNumber: `INV-${Date.now()}`,
      applePayLink: paymentLink.url,
      items: [
        {
          description,
          quantity: 1,
          price: amount
        }
      ]
    });

    // Return the payment link and status
    return NextResponse.json({
      success: true,
      paymentUrl: paymentLink.url,
      message: `Payment link sent to ${email}`
    });

  } catch (error) {
    console.error('Error processing Apple Pay payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
