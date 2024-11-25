import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import axios from 'axios';
import crypto from 'crypto';

const VISA_API_URL = process.env['VISA_API_URL'];
const VISA_USER_ID = process.env['VISA_USER_ID'];
const VISA_PASSWORD = process.env['VISA_PASSWORD'];

export async function POST(request: Request) {
  try {
    const { amount, currency, recipientCard, description } = await request.json();

    if (!amount || !currency || !recipientCard) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields'
        },
        { status: 400 }
      );
    }

    const certificatePath = join(process.cwd(), 'certificates', 'visa-certificate.pem');
    const certificate = readFileSync(certificatePath);

    const timestamp = new Date().toISOString();
    const requestBody = {
      merchantId: process.env['VISA_MERCHANT_ID'],
      merchantName: process.env['VISA_MERCHANT_NAME'],
      terminalId: process.env['VISA_TERMINAL_ID'],
      acquiringBin: process.env['VISA_ACQUIRING_BIN'],
      transactionAmount: amount,
      transactionCurrency: currency,
      recipientPrimaryAccountNumber: recipientCard,
      description: description || 'Payment via Visa Direct',
      timestamp: timestamp
    };

    // Create signature
    const signature = crypto
      .createHmac('sha256', process.env['VISA_SHARED_SECRET'] || '')
      .update(JSON.stringify(requestBody))
      .digest('base64');

    const response = await axios({
      method: 'POST',
      url: `${VISA_API_URL}/visadirect/fundstransfer/v1/pushfundstransactions`,
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
    console.error('Visa Direct payment creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create payment'
      },
      { status: error.response?.status || 500 }
    );
  }
}
