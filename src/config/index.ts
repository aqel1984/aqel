// Ensure all environment variables are properly typed
declare const process: {
  env: {
    NEXT_PUBLIC_WEBSITE_URL?: string;
  };
};

export const config = {
  websiteUrl: process.env['NEXT_PUBLIC_WEBSITE_URL'] || 'https://aqeljehadltd.net',
};

// Validate the configuration
if (!config.websiteUrl) {
  console.warn('NEXT_PUBLIC_WEBSITE_URL is not set. Using default value.');
}

// Freeze the configuration object to prevent accidental modifications
Object.freeze(config);

export default config;