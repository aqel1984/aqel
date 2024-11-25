import { NextResponse } from 'next/server';
import { amendRequestToPay } from '@/lib/visaDirectClient';

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = await req.json();

    // TODO: Add validation for the request body
    if (!body.requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    // Call the Visa Direct API to amend the request to pay
    const result = await amendRequestToPay(body);

    // Return the result
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error amending request to pay:', error);
    return NextResponse.json(
      { error: 'Failed to amend request to pay' },
      { status: 500 }
    );
  }
}