import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { verifyToken } from '../utils/jwt';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL || '',
  token: process.env.UPSTASH_REDIS_TOKEN || '',
});

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
}

export function withRole(requiredRoles: string[]) {
  return function (handler: (request: NextRequest) => Promise<NextResponse>) {
    return async function (request: NextRequest): Promise<NextResponse> {
      try {
        // Extract bearer token
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        
        if (!token) {
          return NextResponse.json(
            { error: 'Authentication token is required' },
            { status: 401 }
          );
        }

        // Check if token is blacklisted
        const isBlacklisted = await redis.get(`blacklist:${token}`);
        if (isBlacklisted) {
          return NextResponse.json(
            { error: 'Token has been revoked' },
            { status: 401 }
          );
        }

        const decoded = await verifyToken(token);
        if (!decoded) {
          return NextResponse.json(
            { error: 'Invalid or expired token' },
            { status: 401 }
          );
        }

        // Get user roles from cache or fetch from source
        const cacheKey = `roles:${decoded.email}`;
        let userRoles = await redis.get<string[]>(cacheKey);

        if (!userRoles) {
          // In a real app, fetch roles from your user service
          userRoles = decoded.roles || [];
          // Cache roles
          await redis.set(cacheKey, userRoles, {
            ex: 300 // 5 minutes
          });
        }

        // Check if user has required roles
        const hasRequiredRole = requiredRoles.some(role => userRoles?.includes(role));
        if (!hasRequiredRole) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }

        // Call the handler
        return handler(request);
      } catch (error) {
        console.error('Authentication error:', error);
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        );
      }
    };
  };
}

export async function revokeToken(token: string): Promise<void> {
  await redis.set(`blacklist:${token}`, true, {
    ex: 86400 // 24 hours
  });
}
