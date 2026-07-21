import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const reviewSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED', 'REVISION_NEEDED']),
  feedback: z.string().optional(),
})

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = reviewSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { decision, feedback } = parsed.data

  if ((decision === 'REJECTED' || decision === 'REVISION_NEEDED') && !feedback) {
    return NextResponse.json(
      { error: 'El feedback es obligatorio para rechazar o solicitar revisión' },
      { status: 400 }
    )
  }

  const article = await db.article.findUnique({ where: { id: params.id } })
  if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 })

  const statusMap = {
    APPROVED: 'APPROVED' as const,
    REJECTED: 'REJECTED' as const,
    REVISION_NEEDED: 'IN_REVIEW' as const,
  }

  const [review, updatedArticle] = await db.$transaction([
    db.editorialReview.create({
      data: {
        articleId: params.id,
        reviewerId: session.userId,
        decision,
        feedback,
      },
    }),
    db.article.update({
      where: { id: params.id },
      data: { status: statusMap[decision] },
    }),
  ])

  await db.auditLog.create({
    data: {
      userId: session.userId,
      action: 'REVIEW_SUBMIT',
      entityType: 'Article',
      entityId: params.id,
      before: { status: article.status },
      after: { status: statusMap[decision], decision, feedback },
    },
  })

  return NextResponse.json({ data: { review, article: updatedArticle } })
}
