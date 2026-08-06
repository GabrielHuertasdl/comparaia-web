/**
 * Cron secret verification.
 *
 * Dependency-free on purpose: this module is imported by middleware.ts, which
 * runs on the Edge runtime where node:crypto is unavailable. Keep it that way.
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET` on scheduled invocations
 * when the CRON_SECRET env var is defined. If it is not defined we fail closed,
 * so a missing secret can never turn a cron endpoint into an open,
 * unauthenticated write endpoint.
 */

/** Constant-time string comparison. Length is not treated as secret. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false

  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return diff === 0
}

export function hasValidCronSecret(authHeader: string | null | undefined): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret || !authHeader) return false

  return safeEqual(authHeader, `Bearer ${secret}`)
}
