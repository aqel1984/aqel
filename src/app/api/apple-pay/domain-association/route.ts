import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET() {
  try {
    // This endpoint should serve the domain association file
    // The file content should be provided by Apple when you register your domain
    // For testing purposes, we'll return a simple response
    return new NextResponse(
      `apple-developer-merchantid-domain-association
${config.applePay.merchantId}
${config.applePay.merchantDomain}`,
      {
        headers: {
          'Content-Type': 'text/plain',
        },
      }
    );
  } catch (error) {
    console.error('Error serving domain association file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
