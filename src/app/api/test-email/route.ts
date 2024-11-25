import { NextResponse } from 'next/server';
import { sendTestEmail, EmailError } from '@/lib/services/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    console.log('Attempting to send test email to:', email);
    console.log('Using Postmark token:', process.env['POSTMARK_SERVER_TOKEN']?.slice(0, 8) + '...');
    console.log('Using From email:', process.env['POSTMARK_FROM_EMAIL']);

    const result = await sendTestEmail(email);
    console.log('Email sent successfully:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Test email error:', error);

    if (error instanceof EmailError) {
      return NextResponse.json(
        {
          error: 'Failed to send test email',
          details: error.message,
          name: error.name,
        },
        { status: 422 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
      },
      { status: 500 }
    );
  }
}
