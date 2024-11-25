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
    const { transactionId } = await request.json();

    if (!transactionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing transaction ID'
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
      transactionId: transactionId,
      timestamp: timestamp
    };

    // Create signature
    const signature = crypto
      .createHmac('sha256', process.env['VISA_SHARED_SECRET'] || '')
      .update(JSON.stringify(requestBody))
      .digest('base64');

    const response = await axios({
      method: 'GET',
      url: `${VISA_API_URL}/visadirect/fundstransfer/v1/pushfundstransactions/${transactionId}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${VISA_USER_ID}:${VISA_PASSWORD}`).toString('base64')}`,
        'x-pay-token': signature,
        'x-request-id': crypto.randomUUID()
      },
      httpsAgent: {
        cert: certificate,
        key: certificate
      }
    });

    // Handle different transaction statuses
    const status = response.data.transactionStatus;
    let success = false;
    let message = '';

    switch (status) {
      case 'COMPLETED':
        success = true;
        message = 'Payment completed successfully';
        break;
      case 'PENDING':
        success = true;
        message = 'Payment is being processed';
        break;
      case 'FAILED':
        success = false;
        message = 'Payment failed';
        break;
      default:
        success = false;
        message = 'Unknown payment status';
    }

    return NextResponse.json({
      success,
      message,
      data: response.data
    });
  } catch (error: any) {
    console.error('Visa Direct payment handling error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to handle payment'
      },
      { status: error.response?.status || 500 }
    );
  }
}
