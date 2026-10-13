import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

// Resolved lazily so `next build` works without the variable; in production a
// missing or short secret fails closed instead of falling back to a known value.
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (secret && secret.length >= 32) return new TextEncoder().encode(secret)
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set to at least 32 characters in production')
  }
  return new TextEncoder().encode('dev-only-secret-not-for-production-use')
}

const COOKIE_NAME = 'admin_token'
const TOKEN_TTL = '7d'

export interface AdminPayload {
  userId: string
  email: string
  role: 'ADMIN' | 'EDITOR' | 'REVIEWER'
}

export async function signAdminJWT(payload: AdminPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getJwtSecret())
}

export async function verifyAdminJWT(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload as unknown as AdminPayload
  } catch {
    return null
  }
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyAdminJWT(token)
}

export function getAdminCookieName(): string {
  return COOKIE_NAME
}
