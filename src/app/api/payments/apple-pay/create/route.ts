import { NextResponse } from 'next/server';
import { wisePaymentService } from '@/lib/services/wise-payment';
import { sendInvoiceEmail } from '@/lib/services/email';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase client
const supabase = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!
);

function generateInvoiceNumber() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `INV-${year}${month}-${random}`;
}

function generateApplePayLink(invoiceNumber: string, amount: number) {
  const baseUrl = process.env['NEXT_PUBLIC_WEBSITE_URL'];
  const params = new URLSearchParams({
    invoice: invoiceNumber,
    amount: amount.toString(),
    currency: 'USD',
  });
  return `${baseUrl}/apple-pay?${params.toString()}`;
}

export async function POST(req: Request) {
  try {
    const { amount, recipientEmail, items } = await req.json();

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'Recipient email is required' },
        { status: 400 }
      );
    }

    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber();

    // Generate Apple Pay link
    const applePayLink = generateApplePayLink(invoiceNumber, amount);

    // Create a quote with Wise
    const quote = await wisePaymentService.createQuote(amount);

    // Store payment info in database
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert({
        invoice_number: invoiceNumber,
        amount,
        currency: 'USD',
        recipient_email: recipientEmail,
        status: 'pending',
        payment_method: 'apple_pay',
        wise_quote_id: quote.id,
        metadata: {
          items,
          quote_details: quote
        }
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Send email with Apple Pay link
    await sendInvoiceEmail({
      to: recipientEmail,
      amount,
      currency: 'USD',
      invoiceNumber,
      applePayLink,
      items,
    });

    return NextResponse.json({
      success: true,
      invoiceNumber,
      applePayLink,
      payment: paymentData
    });
  } catch (error) {
    console.error('Error creating Apple Pay payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
