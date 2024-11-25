import { NextResponse } from 'next/server';
import { sendInvoiceEmail, EmailError } from '@/lib/services/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Real container invoice data
    const testInvoiceData = {
      to: email,
      amount: 100000.00,
      currency: 'USD',
      invoiceNumber: `CNT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      items: [
        {
          description: '20ft Shipping Container',
          quantity: 1,
          unitPrice: 95000.00,
          total: 95000.00
        },
        {
          description: 'Shipping & Handling',
          quantity: 1,
          unitPrice: 3500.00,
          total: 3500.00
        },
        {
          description: 'Insurance',
          quantity: 1,
          unitPrice: 1500.00,
          total: 1500.00
        }
      ],
      applePayLink: `https://pay.aqeljehadltd.net/container-invoice/${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`
    };

    // Map invoice items to match the expected type
    const mappedInvoiceData = {
      ...testInvoiceData,
      items: testInvoiceData.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        price: item.unitPrice // Use unitPrice as price
      }))
    };

    console.log('Attempting to send container invoice email to:', email);
    console.log('Using container invoice data:', mappedInvoiceData);

    const result = await sendInvoiceEmail(mappedInvoiceData);
    console.log('Container invoice email sent successfully:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Container invoice email error:', error);

    if (error instanceof EmailError) {
      return NextResponse.json(
        {
          error: 'Failed to send container invoice email',
          details: error.message,
          name: error.name,
        },
        { status: 422 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to send container invoice email',
        details: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
      },
      { status: 500 }
    );
  }
}
