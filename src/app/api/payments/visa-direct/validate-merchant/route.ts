import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import axios from 'axios';
import crypto from 'crypto';

const VISA_API_URL = process.env['VISA_API_URL'];
const VISA_USER_ID = process.env['VISA_USER_ID'];
const VISA_PASSWORD = process.env['VISA_PASSWORD'];

export async function POST(_request: Request) {
  try {
    const certificatePath = join(process.cwd(), 'certificates', 'visa-certificate.pem');
    const certificate = readFileSync(certificatePath);

    const timestamp = new Date().toISOString();
    const requestBody = {
      merchantId: process.env['VISA_MERCHANT_ID'],
      merchantName: process.env['VISA_MERCHANT_NAME'],
      terminalId: process.env['VISA_TERMINAL_ID'],
      acquiringBin: process.env['VISA_ACQUIRING_BIN'],
      timestamp: timestamp
    };

    // Create signature
    const signature = crypto
      .createHmac('sha256', process.env['VISA_SHARED_SECRET'] || '')
      .update(JSON.stringify(requestBody))
      .digest('base64');

    const response = await axios({
      method: 'POST',
      url: `${VISA_API_URL}/merchant/validate`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${VISA_USER_ID}:${VISA_PASSWORD}`).toString('base64')}`,
        'x-pay-token': signature,
        'x-request-id': crypto.randomUUID()
      },
      data: requestBody,
      httpsAgent: {
        cert: certificate,
        key: certificate
      }
    });

    return NextResponse.json({
      success: true,
      data: response.data
    });
  } catch (error: any) {
    console.error('Visa Direct merchant validation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to validate merchant'
      },
      { status: error.response?.status || 500 }
    );
  }
}
