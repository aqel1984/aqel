export const paymentConfig = {
  applePay: {
    merchantIdentifier: process.env['APPLE_MERCHANT_IDENTIFIER'],
    merchantCertificatePath: process.env['APPLE_MERCHANT_CERTIFICATE_PATH'],
    merchantKeyPath: process.env['APPLE_MERCHANT_KEY_PATH'],
    merchantDomain: process.env['APPLE_MERCHANT_DOMAIN'] || 'your-domain.com',
  },
  appleBusinessChat: {
    businessId: process.env['APPLE_BUSINESS_ID'],
    buttonId: process.env['APPLE_BUTTON_ID'],
    apiKey: process.env['APPLE_BUSINESS_API_KEY'],
  },
  visaDirect: {
    apiKey: process.env['VISA_API_KEY'],
    sharedSecret: process.env['VISA_SHARED_SECRET'],
    userId: process.env['VISA_USER_ID'],
    password: process.env['VISA_PASSWORD'],
    certificatePath: process.env['VISA_CERTIFICATE_PATH'],
    privateKeyPath: process.env['VISA_PRIVATE_KEY_PATH'],
  },
  email: {
    sendgrid: {
      apiKey: process.env['SENDGRID_API_KEY'],
      fromEmail: process.env['SENDGRID_FROM_EMAIL'],
      templates: {
        paymentLink: process.env['SENDGRID_PAYMENT_TEMPLATE_ID'],
        paymentConfirmation: process.env['SENDGRID_CONFIRMATION_TEMPLATE_ID'],
      },
    },
  },
} as const;
