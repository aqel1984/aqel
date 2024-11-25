import { NextRequest } from 'next/server';

export interface MiddlewareRequest extends NextRequest {
  ip?: string;
}

export interface MiddlewareConfig {
  // Base configuration that all middleware can extend
  enabled?: boolean;
  skipPaths?: string[];
}

export interface MiddlewareContext {
  req: MiddlewareRequest;
  config: MiddlewareConfig;
}
