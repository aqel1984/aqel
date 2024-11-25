import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

interface ApplePaySessionRequest {
  amount: number;
  currency: string;
}

interface ApplePaySession {
  sessionId: string;
  merchantIdentifier: string;
  displayName: string;
  initiative: string;
  initiativeContext: string;
  merchantCapabilities: string[];
  supportedNetworks: string[];
  countryCode: string;
  currencyCode: string;
  total: {
    label: string;
    amount: string;
    type: string;
  };
  lineItems: Array<{
    label: string;
    amount: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { amount, currency }: ApplePaySessionRequest = await request.json()

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ message: 'Invalid amount' }, { status: 400 })
    }

    if (!currency || typeof currency !== 'string' || currency.length !== 3) {
      return NextResponse.json({ message: 'Invalid currency' }, { status: 400 })
    }

    const merchantId = process.env['APPLE_PAY_MERCHANT_ID']
    if (!merchantId) {
      console.error('APPLE_PAY_MERCHANT_ID is not set')
      return NextResponse.json({ message: 'Server configuration error' }, { status: 500 })
    }

    const sessionId = uuidv4()

    const applePaySession: ApplePaySession = {
      sessionId: sessionId,
      merchantIdentifier: merchantId,
      displayName: 'Aqel Jehad Ltd',
      initiative: 'web',
      initiativeContext: 'aqeljehadltd.net',
      merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
      supportedNetworks: ['visa', 'masterCard', 'amex'],
      countryCode: 'US', // Replace with your country code
      currencyCode: currency.toUpperCase(),
      total: {
        label: 'Aqel Jehad Ltd',
        amount: amount.toFixed(2),
        type: 'final'
      },
      lineItems: [
        {
          label: 'Subtotal',
          amount: amount.toFixed(2)
        }
      ]
    }

    return NextResponse.json(applePaySession)
  } catch (error) {
    console.error('Error creating Apple Pay session:', error)
    return NextResponse.json({ message: 'Error creating Apple Pay session' }, { status: 500 })
  }
}