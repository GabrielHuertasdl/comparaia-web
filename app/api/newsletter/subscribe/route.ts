import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { COOKIE_POLICY_VERSION } from '@/lib/constants/site'

const subscribeSchema = z.object({
  email: z.string().email('Email inválido'),
  consent: z.literal(true, { errorMap: () => ({ message: 'El consentimiento es obligatorio' }) }),
  segment: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = subscribeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { email, segment } = parsed.data

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      '0.0.0.0'

    // Upsert — no error if already subscribed
    await db.newsletterSubscriber.upsert({
      where: { email },
      create: {
        email,
        consentIp: ip,
        consentVersion: COOKIE_POLICY_VERSION,
        active: true,
        segments: segment ? [segment] : [],
      },
      update: {
        active: true,
        consentAt: new Date(),
        consentIp: ip,
      },
    })

    return NextResponse.json({ data: { subscribed: true } })
  } catch (error) {
    console.error('[Newsletter/subscribe] Error:', error)
    return NextResponse.json({ error: 'Error al procesar la suscripción' }, { status: 500 })
  }
}
