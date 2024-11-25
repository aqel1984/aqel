import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';

interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  roles?: string[];
  permissions?: string[];
  iat?: number;
  exp?: number;
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): Promise<string> {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1d', // 1 day
  });
}
