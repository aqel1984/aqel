export const APPLE_PAY_CONFIG = {
  merchantId: process.env.APPLE_PAY_MERCHANT_ID || 'merchant.aqeljehadltd.net',
  merchantDomain: process.env.APPLE_PAY_MERCHANT_DOMAIN || 'aqeljehadltd.net',
  displayName: process.env.APPLE_PAY_DISPLAY_NAME || 'Aqel Jehad Ltd',
  supportedNetworks: ['visa', 'masterCard', 'amex'],
  merchantCapabilities: ['supports3DS'],
  countryCode: 'US',
  currencyCode: 'USD',
  certificatePaths: {
    merchantIdentity: 'certificates/apple-pay-merchant-identity.pem',
    privateKey: 'certificates/apple-pay-private-key.pem',
    certificate: 'certificates/apple-pay-certificate.pem'
  }
} as const;
