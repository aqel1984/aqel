import * as postmark from 'postmark';
import { Redis } from '@upstash/redis';

const postmarkClient = new postmark.ServerClient(process.env['POSTMARK_SERVER_TOKEN'] || '');
const redis = new Redis({
  url: process.env['UPSTASH_REDIS_URL'] || '',
  token: process.env['UPSTASH_REDIS_TOKEN'] || '',
});

interface AlertConfig {
  type: 'payment_failure' | 'high_value_payment' | 'suspicious_activity';
  threshold?: number;
  recipients: string[];
  cooldownMinutes: number;
}

const DEFAULT_ALERT_CONFIG: Record<AlertConfig['type'], AlertConfig> = {
  payment_failure: {
    type: 'payment_failure',
    recipients: ['manager@aqeljehadltd.net'],
    cooldownMinutes: 15
  },
  high_value_payment: {
    type: 'high_value_payment',
    threshold: 50000, // $50,000
    recipients: ['manager@aqeljehadltd.net'],
    cooldownMinutes: 0 // Always alert for high value payments
  },
  suspicious_activity: {
    type: 'suspicious_activity',
    recipients: ['manager@aqeljehadltd.net'],
    cooldownMinutes: 30
  }
};

export async function sendAlert(
  type: AlertConfig['type'],
  data: Record<string, any>,
  config?: Partial<AlertConfig>
) {
  const baseConfig = DEFAULT_ALERT_CONFIG[type] || DEFAULT_ALERT_CONFIG.payment_failure;
  const alertConfig: AlertConfig = {
    ...baseConfig,
    ...config,
    recipients: config?.recipients || baseConfig.recipients,
    cooldownMinutes: config?.cooldownMinutes ?? baseConfig.cooldownMinutes
  };

  const cooldownKey = `alert:cooldown:${type}`;
  const lastAlert = await redis.get<string>(cooldownKey);

  if (lastAlert && typeof lastAlert === 'string' && alertConfig.cooldownMinutes > 0) {
    const cooldownMs = alertConfig.cooldownMinutes * 60 * 1000;
    const timeSinceLastAlert = Date.now() - parseInt(lastAlert);

    if (timeSinceLastAlert < cooldownMs) {
      return; // Still in cooldown period
    }
  }

  const message = formatAlertMessage(type, data);

  try {
    await Promise.all(
      alertConfig.recipients.map(recipient =>
        postmarkClient.sendEmail({
          From: 'alerts@aqeljehadltd.net',
          To: recipient,
          Subject: `Alert: ${type.replace('_', ' ').toUpperCase()}`,
          TextBody: message,
          MessageStream: 'alerts'
        })
      )
    );

    // Update cooldown timestamp
    await redis.set(cooldownKey, Date.now().toString());
  } catch (error) {
    console.error('Failed to send alert:', error);
    throw new Error('Alert notification failed');
  }
}

function formatAlertMessage(type: AlertConfig['type'], data: Record<string, any>): string {
  switch (type) {
    case 'payment_failure':
      return `
Payment Failure Alert
--------------------
Invoice: ${data['invoiceNumber']}
Amount: $${data['amount']}
Error: ${data['error']}
Time: ${new Date().toISOString()}
      `.trim();

    case 'high_value_payment':
      return `
High Value Payment Alert
-----------------------
Invoice: ${data['invoiceNumber']}
Amount: $${data['amount']}
Customer: ${data['customerName']}
Time: ${new Date().toISOString()}
      `.trim();

    case 'suspicious_activity':
      return `
Suspicious Activity Alert
------------------------
Type: ${data['activityType']}
Details: ${data['details']}
IP Address: ${data['ipAddress']}
Time: ${new Date().toISOString()}
      `.trim();

    default:
      return JSON.stringify(data, null, 2);
  }
}

// Utility function to check if a payment is high value
export function isHighValuePayment(amount: number): boolean {
  const config = DEFAULT_ALERT_CONFIG['high_value_payment'];
  return amount >= (config?.threshold || 50000);
}

// Track failed payment attempts
export async function trackFailedPayment(
  ipAddress: string, 
  invoiceNumber: string
): Promise<boolean> {
  const key = `failed_payments:${ipAddress}`;
  const failureWindow = 15 * 60; // 15 minutes
  
  try {
    // Get current failures
    const failures = await redis.get<string[]>(key) || [];
    const now = Date.now();
    
    // Remove old failures outside the window
    const recentFailures = failures.filter(
      timestamp => (now - parseInt(timestamp)) < failureWindow * 1000
    );
    
    // Add new failure
    recentFailures.push(now.toString());
    
    // Update Redis
    await redis.set(key, recentFailures, { ex: failureWindow });
    
    // Alert if threshold reached
    if (recentFailures.length >= 3) {
      await sendAlert('suspicious_activity', {
        activityType: 'multiple_payment_failures',
        details: `${recentFailures.length} failed payments in ${failureWindow/60} minutes`,
        ipAddress,
        invoiceNumber
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to track payment failure:', error);
    return false;
  }
}
