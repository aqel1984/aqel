import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withRole } from '@/lib/middleware/auth';
import { rateLimitMiddleware } from '@/lib/middleware/rate-limit';
import { generateReceipt, storeReceipt, getReceipt, sendReceiptEmail } from '@/lib/services/receipt';
import { getPaymentById } from '@/lib/services/payment-tracking';

// Input validation schema
const receiptRequestSchema = z.object({
  paymentId: z.string(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    total: z.number().positive(),
  })),
  subtotal: z.number().positive(),
  tax: z.number().nonnegative(),
  total: z.number().positive(),
});

async function handleGenerateReceipt(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(request);
    if (rateLimitResult) return rateLimitResult;

    // Parse and validate request body
    const data = await request.json();
    const validatedData = receiptRequestSchema.parse(data);

    // Get payment details
    const payment = await getPaymentById(validatedData.paymentId);
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.status !== 'completed') {
      return NextResponse.json(
        { error: 'Payment must be completed to generate receipt' },
        { status: 400 }
      );
    }

    // Generate receipt
    const receiptData = {
      invoiceNumber: payment.id,
      customerName: payment.customerName,
      customerEmail: payment.customerEmail,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.createdAt,
      items: validatedData.items,
      subtotal: validatedData.subtotal,
      tax: validatedData.tax,
      total: validatedData.total,
      companyDetails: {
        name: 'Aqel Jehad Ltd.',
        address: '123 Shipping Lane, Port City, PC 12345',
        email: 'support@aqeljehadltd.net',
        phone: '+1 234 567 8900',
        vatNumber: 'VAT123456789',
      },
    };

    const receipt = await generateReceipt(receiptData);

    // Store receipt
    await storeReceipt(payment.id, receipt);

    // Send receipt email
    await sendReceiptEmail(receiptData, receipt);

    return NextResponse.json({
      success: true,
      message: 'Receipt generated and sent successfully',
      data: {
        receiptId: payment.id,
        customerEmail: payment.customerEmail,
        amount: payment.amount,
        currency: payment.currency,
        date: payment.createdAt,
      },
    });

  } catch (error) {
    console.error('Failed to generate receipt:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate receipt' },
      { status: 500 }
    );
  }
}

async function handleGetReceipt(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(request);
    if (rateLimitResult) return rateLimitResult;

    // Get receipt ID from query params
    const { searchParams } = new URL(request.url);
    const receiptId = searchParams.get('receiptId');

    if (!receiptId) {
      return NextResponse.json(
        { error: 'Receipt ID is required' },
        { status: 400 }
      );
    }

    // Get receipt
    const receipt = await getReceipt(receiptId);
    if (!receipt) {
      return NextResponse.json(
        { error: 'Receipt not found' },
        { status: 404 }
      );
    }

    // Return receipt as PDF
    return new NextResponse(receipt, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${receiptId}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Failed to get receipt:', error);
    return NextResponse.json(
      { error: 'Failed to get receipt' },
      { status: 500 }
    );
  }
}

// Export route handlers with role-based access control
export const POST = withRole(['receipt:write'])(handleGenerateReceipt);
export const GET = withRole(['receipt:read'])(handleGetReceipt);
