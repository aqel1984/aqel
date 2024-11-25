import { ServerClient } from 'postmark';
import { logger } from '@/lib/logger';

const log = logger('email-service');

const client = new ServerClient(process.env.POSTMARK_API_KEY || '');

export async function sendPaymentLink({
  email,
  paymentUrl,
  amount,
  currency,
  description,
}: {
  email: string;
  paymentUrl: string;
  amount: number;
  currency: string;
  description: string;
}) {
  try {
    const response = await client.sendEmailWithTemplate({
      From: process.env.EMAIL_FROM || 'payments@aqeljehad.com',
      To: email,
      TemplateId: 'payment-link',
      TemplateModel: {
        paymentUrl,
        amount: amount.toFixed(2),
        currency,
        description,
        expiresIn: '24 hours',
      },
    });

    log.info('Payment link email sent', { email, messageId: response.MessageID });
    return response;
  } catch (error: any) {
    log.error('Failed to send payment link email', error);
    throw new Error('Failed to send payment link email');
  }
}

export async function sendPaymentConfirmation({
  email,
  amount,
  currency,
  description,
  transactionId,
}: {
  email: string;
  amount: number;
  currency: string;
  description: string;
  transactionId: string;
}) {
  try {
    const response = await client.sendEmailWithTemplate({
      From: process.env.EMAIL_FROM || 'payments@aqeljehad.com',
      To: email,
      TemplateId: 'payment-confirmation',
      TemplateModel: {
        amount: amount.toFixed(2),
        currency,
        description,
        transactionId,
        date: new Date().toLocaleDateString(),
      },
    });

    log.info('Payment confirmation email sent', { email, messageId: response.MessageID });
    return response;
  } catch (error: any) {
    log.error('Failed to send payment confirmation email', error);
    throw new Error('Failed to send payment confirmation email');
  }
}
