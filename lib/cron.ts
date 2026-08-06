import { getAdminSession, type AdminPayload } from '@/lib/auth'
import { hasValidCronSecret } from '@/lib/cron-secret'

/**
 * Authorisation for endpoints that are both scheduled (Vercel cron) and
 * manually triggerable from the admin UI.
 *
 * Node runtime only — it reads the admin session cookie via next/headers.
 * Middleware uses hasValidCronSecret from @/lib/cron-secret directly.
 */

export type CronCaller =
  | { kind: 'cron'; userId: null }
  | { kind: 'admin'; userId: string; session: AdminPayload }

/**
 * Returns the caller if authorised, or null. Check for null and respond 401.
 */
export async function authorizeCronOrAdmin(request: Request): Promise<CronCaller | null> {
  if (hasValidCronSecret(request.headers.get('authorization'))) {
    return { kind: 'cron', userId: null }
  }

  const session = await getAdminSession()
  if (session) {
    return { kind: 'admin', userId: session.userId, session }
  }

  return null
}
