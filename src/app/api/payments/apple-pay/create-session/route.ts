import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount, currency = 'USD' } = await req.json();

    if (!amount) {
      return NextResponse.json(
        { error: 'Amount is required' },
        { status: 400 }
      );
    }

    // Create Apple Pay payment request
    const paymentRequest = {
      countryCode: 'US',
      currencyCode: currency,
      supportedNetworks: ['visa', 'masterCard', 'amex'],
      merchantCapabilities: ['supports3DS'],
      total: {
        label: process.env['APPLE_PAY_DISPLAY_NAME'] || 'Aqel Jehad Ltd',
        amount: amount.toString(),
        type: 'final'
      },
      requiredBillingContactFields: ['name', 'email'],
      requiredShippingContactFields: [],
    };

    return NextResponse.json({
      success: true,
      paymentRequest,
      merchantIdentifier: process.env['APPLE_PAY_MERCHANT_ID'],
      domainName: process.env['APPLE_PAY_MERCHANT_DOMAIN'],
      initiative: 'web',
      initiativeContext: process.env['APPLE_PAY_MERCHANT_DOMAIN'],
    });
  } catch (error) {
    console.error('Error creating Apple Pay session:', error);
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    );
  }
}
