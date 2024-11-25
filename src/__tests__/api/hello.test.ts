import { NextRequest, NextResponse } from 'next/server';
import { GET, OPTIONS } from '@/app/api/hello/hello';

const PORT = process.env['PORT'] || 3000;

jest.mock('next/server', () => {
  return {
    NextRequest: jest.fn().mockImplementation((input, init) => ({
      url: input,
      method: init.method,
      headers: new Map(Object.entries(init.headers)),
    })),
    NextResponse: jest.fn().mockImplementation((body, init) => {
      const response = {
        status: init.status,
        headers: new Map(Object.entries(init.headers || {})),
        json: async () => JSON.parse(body),
      };
      return response;
    }),
  };
});

describe('/api/hello', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns a successful response with origin header', async () => {
      const request = new NextRequest(`http://localhost:${PORT}/api/hello`, {
        method: 'GET',
        headers: {
          'origin': `http://localhost:${PORT}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(expect.objectContaining({
        message: 'Hello, world!',
        origin: `http://localhost:${PORT}`,
        timestamp: expect.any(String),
      }));

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(`http://localhost:${PORT}`);
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
    });

    it('handles request without origin header', async () => {
      const request = new NextRequest(`http://localhost:${PORT}/api/hello`, {
        method: 'GET',
        headers: {},
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.origin).toBe('');
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('');
    });

    it('includes timestamp in ISO format', async () => {
      const request = new NextRequest(`http://localhost:${PORT}/api/hello`, {
        method: 'GET',
        headers: {},
      });

      const response = await GET(request);
      const data = await response.json();

      expect(Date.parse(data.timestamp)).not.toBeNaN();
      expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    });
  });

  describe('OPTIONS', () => {
    it('returns a successful response with CORS headers', async () => {
      const request = new NextRequest(`http://localhost:${PORT}/api/hello`, {
        method: 'OPTIONS',
        headers: {
          'origin': `http://localhost:${PORT}`,
        },
      });

      const response = await OPTIONS(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(`http://localhost:${PORT}`);
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
    });

    it('handles OPTIONS request without origin header', async () => {
      const request = new NextRequest(`http://localhost:${PORT}/api/hello`, {
        method: 'OPTIONS',
        headers: {},
      });

      const response = await OPTIONS(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
    });
  });
});