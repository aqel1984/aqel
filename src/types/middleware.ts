import { NextRequest } from 'next/server';

export interface MiddlewareRequest extends NextRequest {
  [key: string]: any;
}

export interface MiddlewareConfig {
  maxRequests?: number;
  windowInSeconds?: number;
  identifier?: string;
}
