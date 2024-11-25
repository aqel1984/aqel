import { NextResponse } from 'next/server';
import { applePayService } from '@/utils/apple-pay-service';

export async function POST(request: Request) {
  try {
    const { validationURL } = await request.json();

    if (!validationURL) {
      return NextResponse.json(
        { error: 'Validation URL is required' },
        { status: 400 }
      );
    }

    const validationResponse = await applePayService.validateMerchant(validationURL);

    return NextResponse.json(validationResponse);
  } catch (error) {
    console.error('Apple Pay merchant validation failed:', error);
    return NextResponse.json(
      { error: 'Merchant validation failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const merchantIdentity = applePayService.getMerchantIdentity();
    const paymentConfig = applePayService.getPaymentRequestConfig();

    return NextResponse.json({
      ...merchantIdentity,
      ...paymentConfig,
    });
  } catch (error) {
    console.error('Failed to get merchant configuration:', error);
    return NextResponse.json(
      { error: 'Failed to get merchant configuration' },
      { status: 500 }
    );
  }
}
