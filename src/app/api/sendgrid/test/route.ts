import { NextResponse } from 'next/server';
import { sendGridService } from '@/utils/sendgrid-service';

export async function POST(_request: Request) {
  try {
    const result = await sendGridService.sendOrderConfirmation(
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
      api_key_set: !!process.env['SENDGRID_API_KEY'],
      from_email: process.env['SENDGRID_FROM_EMAIL'],
      from_name: process.env['SENDGRID_FROM_NAME'],
      templates: {
        order: process.env['SENDGRID_ORDER_TEMPLATE_ID'],
        welcome: process.env['SENDGRID_WELCOME_TEMPLATE_ID'],
        shipping: process.env['SENDGRID_SHIPPING_TEMPLATE_ID'],
        password_reset: process.env['SENDGRID_PASSWORD_RESET_TEMPLATE_ID'],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get configuration status' },
      { status: 500 }
    );
  }
}
