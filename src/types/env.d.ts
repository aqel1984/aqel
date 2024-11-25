declare namespace NodeJS {
  interface ProcessEnv {
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;

    // Google OAuth
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;

    // Apple Pay
    APPLE_PAY_MERCHANT_ID: string;
    APPLE_PAY_MERCHANT_DOMAIN: string;
    APPLE_PAY_DISPLAY_NAME: string;
    APPLE_PAY_WEBHOOK_SECRET: string;
    APPLE_PAY_CERTIFICATE_PATH: string;
    APPLE_PAY_PRIVATE_KEY_PATH: string;
    APPLE_PAY_CSR_PATH: string;

    // Wise API
    WISE_API_KEY: string;
    WISE_PROFILE_ID: string;
    WISE_WEBHOOK_SECRET: string;
    WISE_API_URL: string;
    WISE_WEBHOOK_URL: string;
    WISE_WEBHOOK_PUBLIC_KEY: string;
    WISE_SANDBOX_API_URL: string;

    // Redis
    UPSTASH_REDIS_URL: string;
    UPSTASH_REDIS_TOKEN: string;

    // Email
    EMAIL_FROM: string;
    POSTMARK_SERVER_TOKEN: string;
    RECEIPT_SIGNATURE_KEY: string;

    // Company Info
    COMPANY_NAME: string;
    COMPANY_ADDRESS: string;
    COMPANY_EMAIL: string;

    // Site
    NEXT_PUBLIC_WEBSITE_URL: string;
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_SITE_URL: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
