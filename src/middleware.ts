import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Create default response
  const response = NextResponse.next();

  // Add security headers
  const headers = response.headers;

  // Prevent browsers from performing MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');

  // Enable Cross-Site Scripting (XSS) filter
  headers.set('X-XSS-Protection', '1; mode=block');

  // Prevent page from being displayed in an iframe
  headers.set('X-Frame-Options', 'DENY');

  // Enable strict HTTPS
  headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );

  // Set content security policy
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );

  // Enforce HTTPS in production
  if (process.env['NODE_ENV'] === 'production' && !request.url.startsWith('https://')) {
    return NextResponse.redirect(
      `https://${request.nextUrl.host}${request.nextUrl.pathname}`,
      301
    );
  }

  return response;
}
