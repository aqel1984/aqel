import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import https from 'https'

interface ValidationRequest {
  validationURL: string;
}

interface MerchantSession {
  merchantSessionIdentifier: string;
  nonce: string;
  merchantIdentifier: string;
  domainName: string;
  displayName: string;
  signature: string;
  validationData: string;
  expiresAt: number;
}

// Extend RequestInit to include node-fetch specific options
interface ExtendedRequestInit extends RequestInit {
  agent?: https.Agent;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { validationURL } = body as ValidationRequest;

    if (!validationURL) {
      return NextResponse.json({ error: 'Missing validationURL' }, { status: 400 });
    }

    const certPath = join(process.cwd(), 'certificates', 'merchant_id.pem');
    const keyPath = join(process.cwd(), 'certificates', 'merchant_id.key');

    const [cert, key] = await Promise.all([
      readFile(certPath, 'utf8'),
      readFile(keyPath, 'utf8')
    ]);

    const merchantId = process.env['APPLE_PAY_MERCHANT_ID'];
    if (!merchantId) {
      throw new Error('APPLE_PAY_MERCHANT_ID is not set');
    }

    const agent = new https.Agent({
      cert,
      key,
    });

    const fetchOptions: ExtendedRequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchantIdentifier: merchantId,
        domainName: 'aqeljehadltd.net',
        displayName: 'Aqel Jehad Ltd',
      }),
      agent,
    };

    const response = await fetch(validationURL, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const merchantSession: MerchantSession = await response.json();
    return NextResponse.json(merchantSession);
  } catch (error) {
    console.error('Error validating merchant:', error);
    return NextResponse.json(
      { error: 'Merchant validation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}