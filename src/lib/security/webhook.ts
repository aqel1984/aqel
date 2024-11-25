import crypto from 'crypto';

/**
 * Validates a Wise webhook signature
 * @param payload The raw webhook payload
 * @param signature The signature from the x-wise-signature header
 * @returns boolean indicating if the signature is valid
 */
export async function validateWiseWebhook(
  payload: string,
  signature: string
): Promise<boolean> {
  try {
    const secret = process.env.WISE_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('WISE_WEBHOOK_SECRET is not configured');
    }

    const hmac = crypto.createHmac('sha256', secret);
    const calculatedSignature = hmac.update(payload).digest('base64');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    );
  } catch (error) {
    console.error('Wise webhook signature validation failed:', error);
    return false;
  }
}

/**
 * Validates an Apple Pay webhook signature
 * @param payload The raw webhook payload
 * @param signature The signature from the x-apple-pay-signature header
 * @returns boolean indicating if the signature is valid
 */
export async function validateApplePayWebhook(
  payload: string,
  signature: string
): Promise<boolean> {
  try {
    const secret = process.env.APPLE_PAY_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('APPLE_PAY_WEBHOOK_SECRET is not configured');
    }

    const hmac = crypto.createHmac('sha256', secret);
    const calculatedSignature = hmac.update(payload).digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    );
  } catch (error) {
    console.error('Apple Pay webhook signature validation failed:', error);
    return false;
  }
}

/**
 * Generic webhook signature validation
 * @param payload The raw webhook payload
 * @param signature The signature from the webhook header
 * @param secret The secret key for validation
 * @param algorithm The hashing algorithm to use (default: sha256)
 * @param encoding The encoding for the output (default: hex)
 * @returns boolean indicating if the signature is valid
 */
export async function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  algorithm: string = 'sha256',
  encoding: crypto.BinaryToTextEncoding = 'hex'
): Promise<boolean> {
  try {
    const hmac = crypto.createHmac(algorithm, secret);
    const calculatedSignature = hmac.update(payload).digest(encoding);
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    );
  } catch (error) {
    console.error('Webhook signature validation failed:', error);
    return false;
  }
}
