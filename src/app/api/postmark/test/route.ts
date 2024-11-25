import { NextResponse } from 'next/server';
import { postmarkService } from '@/utils/postmark-service';

export async function POST(_request: Request) {
  try {
    const result = await postmarkService.sendOrderConfirmation(
      'jehadaqel@proton.me',
      {
        orderNumber: 'TEST-123',
        customerName: 'Test Customer',
        items: [
          {
            name: 'Test Item',
            quantity: 1,
            price: 99.99
          }
        ],
        total: 99.99,
        shippingAddress: '123 Test St, Test City, 12345',
        estimatedDelivery: '3-5 business days'
      }
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Failed to send test email:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return configuration status (without sensitive details)
    return NextResponse.json({
      status: 'configured',
      server_id: process.env['POSTMARK_SERVER_ID'],
      from_email: process.env['POSTMARK_FROM_EMAIL'],
      test_mode: process.env['POSTMARK_TEST_MODE'] === 'true',
      templates: {
        order: process.env['POSTMARK_ORDER_TEMPLATE'],
        welcome: process.env['POSTMARK_WELCOME_TEMPLATE'],
        shipping: process.env['POSTMARK_SHIPPING_TEMPLATE'],
        password_reset: process.env['POSTMARK_PASSWORD_RESET_TEMPLATE'],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get configuration status' },
      { status: 500 }
    );
  }
}
