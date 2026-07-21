import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { signAdminJWT, getAdminCookieName } from '@/lib/auth'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = loginSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 400 })
  }

  const { email, password } = parsed.data

  const user = await db.user.findUnique({ where: { email } })
  if (!user) {
    // Prevent timing attacks
    await bcrypt.compare(password, '$2a$12$invalidhashfortimingsafety')
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
  }

  const token = await signAdminJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
  })

  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user.id,
    },
  })

  const response = NextResponse.json({ data: { success: true, role: user.role } })
  response.cookies.set(getAdminCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return response
}

export async function DELETE() {
  const response = NextResponse.json({ data: { loggedOut: true } })
  response.cookies.delete(getAdminCookieName())
  return response
}
