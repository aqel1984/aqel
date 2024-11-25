/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jlyfvrtbmnzmdzpnywmh.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'aqeljehadltd.net',
      },
    ],
  },
  trailingSlash: true,
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizeCss: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: 'https://aqeljehadltd.net/api',
    NEXT_PUBLIC_SITE_URL: 'https://aqeljehadltd.net',
  }
};

module.exports = nextConfig;
