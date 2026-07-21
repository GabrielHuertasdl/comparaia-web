import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sources = await db.source.findMany({
    orderBy: [{ active: 'desc' }, { name: 'asc' }],
  })

  return NextResponse.json({ data: sources })
}

const createSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  type: z.enum(['RSS', 'API', 'MANUAL']).default('RSS'),
})

export async function POST(request: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const source = await db.source.create({ data: parsed.data })
    return NextResponse.json({ data: source }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'URL already exists' }, { status: 409 })
  }
}
