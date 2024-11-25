import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']
const supabaseServiceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY']
const appUrl = 'https://aqeljehadltd.net'

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

interface PaymentData {
  orderId: string;
  amount: number;
  currency: string;
}

export async function POST(request: NextRequest) {
  try {
    const paymentData: PaymentData = await request.json()
    
    if (!paymentData.orderId || typeof paymentData.orderId !== 'string') {
      return NextResponse.json({ message: 'Invalid orderId' }, { status: 400 })
    }
    if (!paymentData.amount || typeof paymentData.amount !== 'number' || paymentData.amount <= 0) {
      return NextResponse.json({ message: 'Invalid amount' }, { status: 400 })
    }
    if (!paymentData.currency || typeof paymentData.currency !== 'string' || paymentData.currency.length !== 3) {
      return NextResponse.json({ message: 'Invalid currency' }, { status: 400 })
    }

    // TODO: Integrate with your payment processor here
    console.log('Processing payment:', paymentData)

    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: 'paid', 
        paidAt: new Date().toISOString(),
        paymentUrl: `${appUrl}/order-confirmation/${paymentData.orderId}`
      })
      .eq('id', paymentData.orderId)
      .select()

    if (error) throw error

    if (!data || data.length === 0) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Payment processed successfully',
      confirmationUrl: `${appUrl}/order-confirmation/${paymentData.orderId}`
    }, { status: 200 })
  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json({ 
      message: 'Error processing payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}