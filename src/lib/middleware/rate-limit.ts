import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { logger } from '../logger';
import type { MiddlewareRequest } from '../types/middleware';

const log = logger('rate-limit-middleware');
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL || '',
  token: process.env.UPSTASH_REDIS_TOKEN || '',
});

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  includeMethod?: boolean;
  skipPaths?: string[];
}

/**
 * Check if a path matches any of the skip patterns
 */
function shouldSkipPath(path: string, patterns?: string[]): boolean {
  if (!patterns?.length) return false;
  
  return patterns.some(pattern => {
    // Convert pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, '.*') // Convert * to .*
      .replace(/\?/g, '.'); // Convert ? to .
    
    return new RegExp(`^${regexPattern}$`).test(path);
  });
}

/**
 * Rate limiting middleware that uses Redis to track request counts
 */
export async function rateLimitMiddleware(
  request: MiddlewareRequest,
  config: RateLimitConfig = { 
    maxRequests: 100, 
    windowMs: 60000, // 1 minute
    includeMethod: true 
  }
): Promise<NextResponse> {
  try {
    const path = request.nextUrl.pathname;

    // Check if path should be skipped
    if (shouldSkipPath(path, config.skipPaths)) {
      return NextResponse.json({ success: true });
    }

    // Get IP address from request
    const ip = request.ip || 
               request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Create Redis key including method if configured
    const method = config.includeMethod ? `:${request.method}` : '';
    const key = `rate-limit:${ip}:${path}${method}`;
    
    // Get current count from Redis
    const currentCount = await redis.incr(key);
    
    // Set expiry on first request
    if (currentCount === 1) {
      await redis.expire(key, Math.floor(config.windowMs / 1000));
    }

    // Get TTL for remaining time
    const ttl = await redis.ttl(key);

    // Set rate limit headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    headers.set('X-RateLimit-Remaining', Math.max(0, config.maxRequests - currentCount).toString());
    headers.set('X-RateLimit-Reset', (Date.now() + (ttl * 1000)).toString());
    
    // Check if rate limit exceeded
    if (currentCount > config.maxRequests) {
      log.warn('Rate limit exceeded', {
        ip,
        path,
        method: request.method,
        currentCount,
        maxRequests: config.maxRequests,
        ttl
      });

      return NextResponse.json(
        { 
          error: 'Too many requests',
          retryAfter: ttl
        },
        { 
          status: 429,
          headers: {
            ...Object.fromEntries(headers.entries()),
            'Retry-After': ttl.toString()
          }
        }
      );
    }

    // Return success response with rate limit headers
    return NextResponse.json(
      { success: true },
      { headers: Object.fromEntries(headers.entries()) }
    );
  } catch (error) {
    log.error('Rate limit middleware error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: request.nextUrl.pathname,
      method: request.method
    });

    // Fail open - allow request through if rate limiting fails
    return NextResponse.json({ success: true });
  }
}
