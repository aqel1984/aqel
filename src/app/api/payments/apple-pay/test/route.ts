import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Get merchant configuration
    const merchantId = process.env['APPLE_PAY_MERCHANT_ID'];
    const merchantDomain = process.env['APPLE_PAY_MERCHANT_DOMAIN'];
    const displayName = process.env['APPLE_PAY_DISPLAY_NAME'];

    // Check if all required configuration is present
    if (!merchantId || !merchantDomain || !displayName) {
      return NextResponse.json({
        success: false,
        error: 'Missing merchant configuration',
        config: {
          hasMerchantId: !!merchantId,
          hasMerchantDomain: !!merchantDomain,
          hasDisplayName: !!displayName
        }
      });
    }

    // Check certificate existence
    let certificateExists = false;
    try {
      certificateExists = fs.existsSync(
        path.join(process.cwd(), 'certificates', 'apple-pay-merchant-identity.pem')
      );
    } catch (error) {
      console.error('Error checking certificate:', error);
    }

    return NextResponse.json({
      success: true,
      merchantConfig: {
        merchantId,
        merchantDomain,
        displayName,
        certificateExists
      }
    });
  } catch (error) {
    console.error('Error in Apple Pay test:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
