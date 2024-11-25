import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET() {
  try {
    // Check Redis connection
    await redis.ping();

    return NextResponse.json(
      { 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          redis: 'connected',
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      { 
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
