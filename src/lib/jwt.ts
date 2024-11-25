import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key';

export interface JWTPayload {
  userId: string;
  email: string;
  name?: string;
  sub?: string;
  role?: string;
  roles?: string[];
  permissions?: string[];
  iat?: number;
  exp?: number;
}

export async function generateToken(payload: JWTPayload): Promise<string> {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function refreshToken(token: string): Promise<string | null> {
  try {
    const decoded = await verifyToken(token);
    if (!decoded) return null;
    
    // Generate new token with updated expiry
    return generateToken(decoded);
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}
