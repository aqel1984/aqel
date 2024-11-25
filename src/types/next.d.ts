import type { NextRequest as BaseNextRequest } from 'next/server';

declare module 'next/server' {
  interface NextRequest {
    [INTERNALS]?: {
      cookies: Map<string, string>;
      geo?: {
        city?: string;
        country?: string;
        region?: string;
        latitude?: string;
        longitude?: string;
      };
      ip?: string;
      url?: string;
    };
  }
}

export {};
