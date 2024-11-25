import { NextResponse } from 'next/server';
import { wisePaymentService } from '@/lib/services/wise-payment';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!
);

export async function POST(req: Request) {
  try {
    const { amount, recipientName, iban } = await req.json();

    // Create a quote
    const quote = await wisePaymentService.createQuote(amount);
    console.log('Quote created:', quote);

    // Create a recipient
    const recipient = await wisePaymentService.createRecipient(recipientName, iban);
    console.log('Recipient created:', recipient);

    // Create a transfer
    const reference = `TEST-${Date.now()}`;
    const transfer = await wisePaymentService.createTransfer(
      quote.id,
      recipient.id,
      reference
    );
    console.log('Transfer created:', transfer);

    // Store transfer in database
    const { data: transferData, error: transferError } = await supabase
      .from('transfers')
      .insert({
        wise_transfer_id: transfer.id,
        amount: amount,
        currency: 'USD',
        status: transfer.status,
        payment_method: 'wise',
        recipient_name: recipientName,
        description: `Test payment: ${reference}`,
        metadata: {
          quote_id: quote.id,
          recipient_id: recipient.id
        }
      })
      .select()
      .single();

    if (transferError) throw transferError;

    // Fund the transfer
    await wisePaymentService.fundTransfer(transfer.id);
    console.log('Transfer funded');

    // Get final status
    const status = await wisePaymentService.getTransferStatus(transfer.id);
    console.log('Final status:', status);

    return NextResponse.json({
      success: true,
      transfer: transferData,
      status
    });
  } catch (error) {
    console.error('Error in test payment:', error);
    return NextResponse.json(
      { error: 'Payment test failed' },
      { status: 500 }
    );
  }
}
