import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { validationURL } = await req.json();

    if (!validationURL) {
      return NextResponse.json(
        { error: 'Validation URL is required' },
        { status: 400 }
      );
    }

    // Check if certificate exists
    try {
      await fs.access(path.join(process.cwd(), 'certificates', 'apple-pay-merchant-identity.pem'));
    } catch (error) {
      console.error('Apple Pay merchant identity certificate not found:', error);
      return NextResponse.json(
        { error: 'Merchant identity certificate not found' },
        { status: 500 }
      );
    }

    const merchantId = process.env['APPLE_PAY_MERCHANT_ID'];
    const merchantDomain = process.env['APPLE_PAY_MERCHANT_DOMAIN'];

    if (!merchantId || !merchantDomain) {
      throw new Error('Missing Apple Pay merchant configuration');
    }

    // Make request to Apple Pay servers for session validation
    const response = await fetch(validationURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchantIdentifier: merchantId,
        domainName: merchantDomain,
        displayName: process.env['APPLE_PAY_DISPLAY_NAME'] || 'Aqel Jehad Ltd',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to validate with Apple Pay servers');
    }

    const merchantSession = await response.json();
    return NextResponse.json(merchantSession);
  } catch (error) {
    console.error('Error validating Apple Pay merchant:', error);
    return NextResponse.json(
      { error: 'Merchant validation failed' },
      { status: 500 }
    );
  }
}
