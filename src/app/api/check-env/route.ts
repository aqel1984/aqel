import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    postmarkConfigured: {
      hasToken: !!process.env['POSTMARK_SERVER_TOKEN'],
      tokenLength: process.env['POSTMARK_SERVER_TOKEN']?.length || 0,
      hasFromEmail: !!process.env['POSTMARK_FROM_EMAIL'],
      fromEmail: process.env['POSTMARK_FROM_EMAIL'],
    }
  });
}
