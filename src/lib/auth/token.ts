import { SignJWT, jwtVerify } from 'jose'
import { nanoid } from 'nanoid'
import { getJwtSecretKey } from './jwt'

interface TokenPayload {
    jti: string
    iat: number
}

interface UserPayload extends TokenPayload {
  isAdmin?: boolean;
  userId?: string;
  email?: string;
}

export async function createToken(payload: any) {
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setJti(nanoid())
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(new TextEncoder().encode(getJwtSecretKey()))

    return token
}

export async function verifyToken(token: string): Promise<TokenPayload> {
    try {
        const verified = await jwtVerify(
            token,
            new TextEncoder().encode(getJwtSecretKey())
        )
        return verified.payload as TokenPayload
    } catch (err) {
        throw new Error('Your token has expired.')
    }
}

export const validateToken = async (token: string): Promise<UserPayload | null> => {
  try {
    const verified = await verifyToken(token);
    return verified as UserPayload;
  } catch (err) {
    return null;
  }
};
