import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await db.publicationQueue.findMany({
    orderBy: [{ priority: 'desc' }, { addedAt: 'asc' }],
    include: {
      article: {
        select: {
          id: true,
          title: true,
          excerpt: true,
          sourceUrl: true,
          relevanceScore: true,
          keyPoints: true,
          status: true,
          contentType: true,
          source: { select: { name: true } },
        },
      },
    },
  })

  return NextResponse.json({ data: items })
}

const addSchema = z.object({
  articleId: z.string(),
  priority: z.number().min(1).max(10).optional().default(5),
  notes: z.string().optional(),
})

export async function POST(request: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = addSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const item = await db.publicationQueue.create({
    data: parsed.data,
    include: { article: true },
  })

  return NextResponse.json({ data: item }, { status: 201 })
}
