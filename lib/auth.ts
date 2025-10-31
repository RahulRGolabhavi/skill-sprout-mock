import jwt from 'jsonwebtoken';

const SECRET = process.env.MOCK_JWT_SECRET || 'supersecretlocalkey';

export type TokenPayload = {
  sub: string;
  email?: string;
  name?: string;
  iss?: string;
  aud?: string;
};

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET) as TokenPayload;
    return decoded;
  } catch (e) {
    return null;
  }
}

export function getBearerToken(header?: string | null): string | null {
  if (!header) return null;
  const m = header.match(/Bearer (.+)/);
  return m ? m[1] : null;
}
