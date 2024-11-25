import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import fs from 'fs';
import path from 'path';
import https from 'https';

interface ApplePayValidationResponse {
  merchantIdentifier: string;
  displayName: string;
  domainName: string;
  merchantSessionIdentifier: string;
  signature: string;
  validationData: string[];
}

async function validateWithApple(validationUrl: string): Promise<ApplePayValidationResponse> {
  const certPath = path.join(process.cwd(), 'certificates', 'apple-pay-merchant-id.pem');
  const keyPath = path.join(process.cwd(), 'certificates', 'apple-pay-merchant-id-key.pem');

  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    throw new Error('Apple Pay certificates not found');
  }

  const cert = fs.readFileSync(certPath);
  const key = fs.readFileSync(keyPath);

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      merchantIdentifier: config.applePay.merchantId,
      displayName: config.applePay.merchantName,
      domainName: config.applePay.merchantDomain,
      initiative: 'web',
      initiativeContext: config.applePay.merchantDomain,
    });

    const options = {
      method: 'POST',
      cert,
      key,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = https.request(validationUrl, options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const validationResponse = JSON.parse(responseData);
          resolve(validationResponse);
        } catch (error) {
          reject(new Error('Failed to parse Apple Pay validation response'));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

export async function POST(request: Request) {
  try {
    const { validationURL } = await request.json();

    if (!validationURL) {
      return NextResponse.json(
        { error: 'Validation URL is required' },
        { status: 400 }
      );
    }

    // For local development without certificates
    if (process.env['NODE_ENV'] === 'development') {
      console.log('Using mock validation in development mode');
      return NextResponse.json({
        merchantIdentifier: config.applePay.merchantId,
        displayName: config.applePay.merchantName,
        domainName: config.applePay.merchantDomain,
        merchantSessionIdentifier: `merchant_sid_${Date.now()}`,
        signature: 'mock_signature',
        validationData: ['mock_validation_data'],
      });
    }

    // Production validation with Apple
    const validationResponse = await validateWithApple(validationURL);
    return NextResponse.json(validationResponse);

  } catch (error) {
    console.error('Error validating merchant:', error);
    return NextResponse.json(
      { error: 'Failed to validate merchant' },
      { status: 500 }
    );
  }
}
