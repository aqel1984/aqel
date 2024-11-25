import { NextResponse } from 'next/server';
import { sendInvoiceEmail, EmailError } from '@/lib/services/email';

interface ContainerInvoiceRequest {
  recipientEmail: string;
  containerSize: '20ft' | '40ft';
  containerPrice: number;
  shippingCost: number;
  insuranceCost: number;
  customerReference?: string;
}

export async function POST(request: Request) {
  try {
    const {
      recipientEmail,
      containerSize,
      containerPrice,
      shippingCost,
      insuranceCost,
      customerReference
    } = await request.json() as ContainerInvoiceRequest;

    // Validate required fields
    if (!recipientEmail || !containerSize || !containerPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique invoice number
    const invoiceNumber = `CNT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    // Calculate total amount
    const totalAmount = containerPrice + shippingCost + insuranceCost;

    // Create invoice data
    const invoiceData = {
      to: recipientEmail,
      amount: totalAmount,
      currency: 'USD',
      invoiceNumber,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      items: [
        {
          description: `${containerSize} Shipping Container${customerReference ? ` (Ref: ${customerReference})` : ''}`,
          quantity: 1,
          price: containerPrice
        },
        {
          description: 'Shipping & Handling',
          quantity: 1,
          price: shippingCost
        },
        {
          description: 'Insurance',
          quantity: 1,
          price: insuranceCost
        }
      ],
      applePayLink: `https://pay.aqeljehadltd.net/container-invoice/${invoiceNumber}`
    };

    // Send the invoice email
    const result = await sendInvoiceEmail(invoiceData);

    // Return success response with invoice details
    return NextResponse.json({
      success: true,
      invoiceNumber,
      totalAmount,
      messageId: result.messageId,
      message: 'Container invoice sent successfully'
    });

  } catch (error) {
    console.error('Failed to send container invoice:', error);

    if (error instanceof EmailError) {
      return NextResponse.json(
        {
          error: 'Failed to send container invoice',
          details: error.message,
          name: error.name,
        },
        { status: 422 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to send container invoice',
        details: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
      },
      { status: 500 }
    );
  }
}
