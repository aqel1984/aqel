import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import rateLimit from 'express-rate-limit';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { logger } from '@/lib/utils/logger';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL || '',
  token: process.env.UPSTASH_REDIS_TOKEN || '',
});

// Configure rate limiter
const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'invoice_ratelimit',
  points: 10, // Number of requests
  duration: 3600, // Per hour
  blockDuration: 3600, // Block for 1 hour if limit exceeded
});

export async function rateLimitMiddleware(req: NextRequest) {
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
  const path = req.nextUrl.pathname;

  try {
    const rateLimitRes = await rateLimiter.consume(ip);
    
    // Add rate limit headers
    const headers = new Headers({
      'X-RateLimit-Limit': '10',
      'X-RateLimit-Remaining': String(rateLimitRes.remainingPoints),
      'X-RateLimit-Reset': new Date(Date.now() + rateLimitRes.msBeforeNext).toISOString(),
    });

    // Log rate limit consumption
    logger.debug({
      message: 'Rate limit consumed',
      ip,
      path,
      remaining: rateLimitRes.remainingPoints,
    });

    return new NextResponse(null, { headers });
  } catch (error) {
    if (error instanceof Error) {
      // Log rate limit exceeded
      logger.warn({
        message: 'Rate limit exceeded',
        ip,
        path,
        error: error.message,
      });

      const resetTime = new Date(Date.now() + error.msBeforeNext);
      
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again after ${resetTime.toISOString()}`,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil(error.msBeforeNext / 1000)),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Reset': resetTime.toISOString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // Log unexpected errors
    logger.error({
      message: 'Rate limit error',
      ip,
      path,
      error,
    });

    // For unknown errors, return a generic error response
    return new NextResponse(
      JSON.stringify({
        error: 'Rate Limit Error',
        message: 'An error occurred while checking rate limit',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
