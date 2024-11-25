import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency, description } = body;
    const headersList = headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env['NODE_ENV'] === 'production' ? 'https' : 'http';

    // Generate payment link using the current host
    const paymentLink = `${protocol}://${host}/visa-direct?amount=${amount}&currency=${currency}&description=${encodeURIComponent(description)}`;

    return NextResponse.json({
      success: true,
      paymentLink
    });
  } catch (error) {
    console.error('Error creating Visa Direct link:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create Visa Direct payment link'
    });
  }
}
