import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']
const supabaseServiceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

interface WebhookData {
  type: string
  transfer_state: string
  resource: {
    reference: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const wiseWebhookSecret = process.env['WISE_WEBHOOK_SECRET'];
    if (!wiseWebhookSecret) {
      throw new Error('WISE_WEBHOOK_SECRET is not configured');
    }

    const signature = request.headers.get('x-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 401 }
      );
    }

    // Get the raw request body
    const data = await request.text();

    // Verify webhook signature
    const hmac = crypto.createHmac('sha256', wiseWebhookSecret);
    hmac.update(data);
    const calculatedSignature = hmac.digest('hex');

    if (signature !== calculatedSignature) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    let webhookData: WebhookData;
    try {
      webhookData = JSON.parse(data) as WebhookData;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON in webhook data' }, { status: 400 });
    }

    if (!webhookData || typeof webhookData !== 'object') {
      return NextResponse.json({ error: 'Invalid webhook data structure' }, { status: 400 });
    }

    if (webhookData.type === 'transfer.state_change' && webhookData.transfer_state === 'completed') {
      const reference = webhookData.resource?.reference
      if (typeof reference !== 'string') {
        throw new Error('Invalid reference')
      }

      const orderId = reference.replace(/^Order /, '')

      if (!/^\d+$/.test(orderId)) {
        throw new Error('Invalid order ID')
      }

      const { data: updatedOrder, error } = await supabase
        .from('orders')
        .update({ status: 'paid', paidAt: new Date().toISOString() })
        .eq('id', orderId)
        .select()

      if (error) throw error

      if (!updatedOrder || updatedOrder.length === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      return NextResponse.json({ message: 'Webhook processed successfully', order: updatedOrder[0] })
    } else {
      return NextResponse.json({ message: 'Webhook received but no action taken' })
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}