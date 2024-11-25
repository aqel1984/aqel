export const visaConfig = {
  // API Configuration
  keyId: '547bfc01-8c22-4747-b273-f13e18b3d943',
  apiUrl: process.env['VISA_API_URL'] || 'https://sandbox.api.visa.com',
  apiKey: process.env['VISA_API_KEY'],
  apiSecret: process.env['VISA_API_SECRET'],
  webhookSecret: process.env['VISA_WEBHOOK_SECRET'],
  webhookUrl: 'https://api.aqeljehadltd.net/visa-direct/callback',
  
  // Merchant Configuration
  merchantId: process.env['VISA_MERCHANT_ID'],
  merchantName: process.env['VISA_MERCHANT_NAME'] || 'Aqel Jehad Ltd',
  merchantCategoryCode: '4214', // Transportation Services
  acquiringBin: process.env['VISA_ACQUIRING_BIN'],
  terminalId: process.env['VISA_TERMINAL_ID'],
  
  // Certificate Paths
  certificates: {
    clientCert: 'certificates/visa/client-cert.pem',
    privateKey: 'certificates/visa/privateKey.pem',
    rootCa: 'certificates/visa/root-ca.pem',
    issuingCa: 'certificates/visa/issuing-ca.pem',
    keystore: 'certificates/visa/visa_keystore.p12'
  },
  
  // Transaction Settings
  defaultCurrency: 'USD',
  supportedCurrencies: ['USD', 'EUR', 'GBP', 'AED'],
  
  // Rate Limiting
  rateLimit: {
    window: 60 * 1000, // 1 minute
    max: 100 // maximum requests per window
  },
  
  // Email Settings
  notificationEmail: process.env['VISA_NOTIFICATION_EMAIL'] || 'support@aqeljehadltd.net',
  
  // Endpoints
  endpoints: {
    pushPayments: '/visadirect/v1/pushpayments',
    refunds: '/visadirect/v1/refunds',
    merchantValidation: '/merchantsearch/v1/validate'
  },
  
  // Timeout Settings
  timeout: {
    request: 30000, // 30 seconds
    connection: 5000 // 5 seconds
  },
  
  // Retry Settings
  retry: {
    maxAttempts: 3,
    initialDelay: 1000, // 1 second
    maxDelay: 5000 // 5 seconds
  }
} as const;

// Environment validation
export function validateVisaConfig() {
  const requiredEnvVars = [
    'VISA_API_KEY',
    'VISA_API_SECRET',
    'VISA_MERCHANT_ID',
    'VISA_ACQUIRING_BIN',
    'VISA_TERMINAL_ID',
    'VISA_WEBHOOK_SECRET'
  ];

  const missingVars = requiredEnvVars.filter(
    varName => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Visa configuration: ${missingVars.join(', ')}`
    );
  }

  // Validate certificate files exist
  const fs = require('fs');
  const path = require('path');
  const certFiles = Object.values(visaConfig.certificates);
  
  for (const certFile of certFiles) {
    const certPath = path.join(process.cwd(), certFile);
    if (!fs.existsSync(certPath)) {
      throw new Error(`Missing certificate file: ${certFile}`);
    }
  }

  return true;
}

// Utility function to get sandbox/production URLs
export function getVisaApiUrl(endpoint: keyof typeof visaConfig.endpoints): string {
  return `${visaConfig.apiUrl}${visaConfig.endpoints[endpoint]}`;
}

// Export types for TypeScript support
export type VisaConfig = typeof visaConfig;
export type VisaEndpoint = keyof typeof visaConfig.endpoints;
