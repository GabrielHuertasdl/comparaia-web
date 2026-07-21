import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback-secret-min-32-chars-replace-in-prod'
)

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
    .sign(JWT_SECRET)
}

export async function verifyAdminJWT(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
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
