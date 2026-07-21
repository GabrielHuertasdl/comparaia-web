import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const article = await db.article.findUnique({ where: { id: params.id } })
  if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 })

  if (article.status !== 'APPROVED') {
    return NextResponse.json(
      { error: `El artículo debe estar en estado APPROVED. Estado actual: ${article.status}` },
      { status: 422 }
    )
  }

  const publishedAt = new Date()

  const updated = await db.article.update({
    where: { id: params.id },
    data: { status: 'PUBLISHED', publishedAt },
  })

  await db.auditLog.create({
    data: {
      userId: session.userId,
      action: 'PUBLISH',
      entityType: 'Article',
      entityId: params.id,
      before: { status: article.status },
      after: { status: 'PUBLISHED', publishedAt: publishedAt.toISOString() },
    },
  })

  // Revalidate relevant paths
  revalidatePath('/noticias')
  revalidatePath(`/noticias/${article.slug}`)
  revalidatePath('/')

  if (article.contentType === 'COMPARISON') {
    revalidatePath('/comparativas')
    revalidatePath(`/comparativas/${article.slug}`)
  } else if (article.contentType === 'RANKING') {
    revalidatePath('/rankings')
  } else if (article.contentType === 'GUIDE') {
    revalidatePath('/guias')
    revalidatePath(`/guias/${article.slug}`)
  }

  return NextResponse.json({ data: { slug: updated.slug, publishedAt: updated.publishedAt } })
}
