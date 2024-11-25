export const config = {
  supabase: {
    url: process.env['NEXT_PUBLIC_SUPABASE_URL'],
    anonKey: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'],
    serviceRoleKey: process.env['SUPABASE_SERVICE_ROLE_KEY'],
  },
  wise: {
    apiKey: process.env['WISE_API_KEY'],
    profileId: process.env['WISE_PROFILE_ID'],
  },
  applePay: {
    merchantId: process.env['APPLE_PAY_MERCHANT_ID'],
    merchantName: process.env['APPLE_PAY_DISPLAY_NAME'],
    merchantDomain: process.env['APPLE_PAY_MERCHANT_DOMAIN'],
  },
  database: {
    host: process.env['DB_HOST'],
    user: process.env['DB_USER'],
    password: process.env['DB_PASSWORD'],
    name: process.env['DB_NAME'],
  },
  website: {
    url: process.env['NEXT_PUBLIC_WEBSITE_URL'],
  },
  server: {
    httpsPort: process.env['HTTPS_PORT'],
    httpPort: process.env['HTTP_PORT'],
  },
  visa: {
    apiUrl: process.env['VISA_API_URL'],
    apiKey: process.env['VISA_API_KEY'],
    apiSecret: process.env['VISA_API_SECRET'],
  },
};

// Validate required environment variables
Object.entries(config).forEach(([category, values]) => {
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined) {
      console.warn(`Missing environment variable for config.${category}.${key}`);
    }
  });
});