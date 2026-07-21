import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createHash, randomUUID } from 'crypto'
import { z } from 'zod'

const consentSchema = z.object({
  analytics: z.boolean(),
  advertising: z.boolean(),
  policyVersion: z.string(),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = consentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '0.0.0.0'

  const ipHash = createHash('sha256').update(ip).digest('hex')

  let sessionToken = request.cookies.get('consent_session')?.value
  if (!sessionToken) sessionToken = randomUUID()

  await db.cookieConsent.upsert({
    where: { sessionToken },
    create: {
      sessionToken,
      analytics: parsed.data.analytics,
      advertising: parsed.data.advertising,
      functional: true,
      ipHash,
      policyVersion: parsed.data.policyVersion,
    },
    update: {
      analytics: parsed.data.analytics,
      advertising: parsed.data.advertising,
      policyVersion: parsed.data.policyVersion,
    },
  })

  const response = NextResponse.json({ data: { saved: true } })
  response.cookies.set('consent_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  })

  return response
}
