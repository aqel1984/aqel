import { NextResponse } from 'next/server';
import { verifyToken } from '../lib/jwt';
import { logger } from '../lib/logger';
import { graphService } from '../utils/graph-service';
import type { MiddlewareRequest } from '../lib/types/middleware';

const log = logger('auth-middleware');

export interface AuthenticatedUser {
  id: string;
  email: string | undefined;
  name: string | undefined;
  roles: string[] | undefined;
}

export type AuthenticatedHandler = (
  request: MiddlewareRequest,
  user: AuthenticatedUser
) => Promise<NextResponse>;

export async function authMiddleware(
  request: MiddlewareRequest,
  handler: AuthenticatedHandler
): Promise<NextResponse> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    try {
      // Verify JWT token
      const decoded = await verifyToken(token);
      if (!decoded || !decoded.sub) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }

      // Get user from Graph API
      const userProfile = await graphService.getUserProfile(decoded.sub);
      if (!userProfile) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 401 }
        );
      }

      const user: AuthenticatedUser = {
        id: decoded.sub,
        email: userProfile.email,
        name: userProfile.displayName,
        roles: userProfile.roles
      };

      // Call handler with authenticated user
      return await handler(request, user);
    } catch (error) {
      log.error('Authentication failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
  } catch (error) {
    log.error('Unexpected error in auth middleware', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
