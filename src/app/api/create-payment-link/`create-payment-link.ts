import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createRecipient } from '@/lib/wise'

interface PaymentRequest {
  currency: string;
  email: string;
  name: string;
  amount: number;
  orderId: string;
}

interface WiseRecipient {
  id: string;
  currency: string;
  type: string;
  profile: string;
  accountHolderName: string;
  details: {
    email: string;
  };
}

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']
const supabaseServiceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY']
const appUrl = 'https://aqeljehadltd.net'

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function POST(request: NextRequest) {
  try {
    const { currency, email, name, amount, orderId }: PaymentRequest = await request.json()

    if (!currency || typeof currency !== 'string' || currency.length !== 3) {
      return NextResponse.json({ message: 'Invalid currency' }, { status: 400 })
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ message: 'Invalid email' }, { status: 400 })
    }
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ message: 'Invalid name' }, { status: 400 })
    }
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ message: 'Invalid amount' }, { status: 400 })
    }
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ message: 'Invalid orderId' }, { status: 400 })
    }

    const recipient = await createRecipient(currency, email, name) as WiseRecipient;
    
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        orderId,
        recipientId: recipient.id,
        amount,
        currency,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating payment record:', error)
      return NextResponse.json({ message: 'Error creating payment record' }, { status: 500 })
    }

    if (!payment) {
      return NextResponse.json({ message: 'Failed to create payment record' }, { status: 500 })
    }

    const paymentLink = `${appUrl}/pay/${payment.id}`

    return NextResponse.json({ paymentLink })
  } catch (error) {
    console.error('Error creating payment link:', error)
    return NextResponse.json({ message: 'Error creating payment link' }, { status: 500 })
  }
}