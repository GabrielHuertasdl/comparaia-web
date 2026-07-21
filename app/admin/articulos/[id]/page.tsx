import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { ArticleStatus, ReviewDecision } from '@prisma/client'
import { getAdminSession } from '@/lib/auth'
import { ArticleEditor } from '@/components/admin/ArticleEditor'
import { ReviewPanel } from '@/components/admin/ReviewPanel'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ArticuloEditorPage({ params }: PageProps) {
  const { id } = await params
  const session = await getAdminSession()

  const article = await db.article.findUnique({
    where: { id },
    include: { source: { select: { name: true } } },
  })

  if (!article) notFound()

  // Server Actions
  async function saveArticle(data: {
    title?: string | null
    slug?: string | null
    excerpt?: string | null
    body?: string | null
    metaTitle?: string | null
    metaDescription?: string | null
  }) {
    'use server'
    await db.article.update({
      where: { id },
      data: {
        ...(data.title != null && { title: data.title }),
        ...(data.slug != null && { slug: data.slug }),
        ...(data.excerpt != null && { excerpt: data.excerpt }),
        ...(data.body != null && { body: data.body }),
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
        status: ArticleStatus.DRAFTING,
      },
    })
    revalidatePath(`/admin/articulos/${id}`)
  }

  async function submitReview(decision: string, feedback?: string) {
    'use server'
    if (!session) return

    const prismaDecision = decision as ReviewDecision

    await db.editorialReview.create({
      data: {
        articleId: id,
        reviewerId: session.userId,
        decision: prismaDecision,
        feedback: feedback ?? null,
      },
    })

    let newStatus: ArticleStatus = ArticleStatus.IN_REVIEW
    if (prismaDecision === ReviewDecision.APPROVED) newStatus = ArticleStatus.APPROVED
    if (prismaDecision === ReviewDecision.REJECTED) newStatus = ArticleStatus.REJECTED

    await db.article.update({
      where: { id },
      data: { status: newStatus },
    })

    revalidatePath(`/admin/articulos/${id}`)

    if (prismaDecision === ReviewDecision.APPROVED) {
      redirect('/admin/cola')
    }
  }

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl font-heading font-bold text-foreground line-clamp-1">
          {article.title}
        </h1>
        {article.source && (
          <p className="text-sm text-muted-foreground mt-0.5">
            Fuente: {article.source.name}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor — 2/3 width */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
          <ArticleEditor
            article={{
              id: article.id,
              title: article.title,
              excerpt: article.excerpt,
              body: article.body,
              metaTitle: article.metaTitle,
              metaDescription: article.metaDescription,
              slug: article.slug,
              status: article.status,
              keyPoints: article.keyPoints,
              sourceUrl: article.sourceUrl,
            }}
            onSave={saveArticle}
          />
        </div>

        {/* Review panel — 1/3 width */}
        <div className="space-y-4">
          <ReviewPanel
            articleId={article.id}
            currentStatus={article.status}
            onDecision={submitReview}
          />

          {/* Meta info */}
          <div className="rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground space-y-1">
            <p>
              <span className="font-medium text-foreground">Tipo:</span> {article.contentType}
            </p>
            <p>
              <span className="font-medium text-foreground">Relevancia:</span>{' '}
              {(article.relevanceScore * 10).toFixed(1)}/10
            </p>
            {article.scheduledAt && (
              <p>
                <span className="font-medium text-foreground">Programado:</span>{' '}
                {article.scheduledAt.toLocaleDateString('es-ES')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
