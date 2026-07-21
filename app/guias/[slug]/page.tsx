import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArticleHeader } from '@/components/editorial/ArticleHeader'
import { ArticleBody } from '@/components/editorial/ArticleBody'
import { RelatedArticles } from '@/components/editorial/RelatedArticles'
import Breadcrumb from '@/components/layout/Breadcrumb'
import ArticleJsonLd from '@/components/seo/ArticleJsonLd'
import { buildArticleMeta } from '@/lib/seo/metadata'
import { readingTime } from '@/lib/utils/format'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await db.article.findUnique({
    where: { slug: params.slug, status: 'PUBLISHED', contentType: 'GUIDE' },
  })
  if (!article) return {}
  return buildArticleMeta(article as any)
}

export async function generateStaticParams() {
  const guides = await db.article.findMany({
    where: { status: 'PUBLISHED', contentType: 'GUIDE' },
    select: { slug: true },
    take: 100,
    orderBy: { publishedAt: 'desc' },
  })
  return guides.map((g) => ({ slug: g.slug }))
}

export const revalidate = 86400

export default async function GuiaPage({ params }: Props) {
  const article = await db.article.findUnique({
    where: { slug: params.slug, status: 'PUBLISHED', contentType: 'GUIDE' },
    include: {
      author: { select: { name: true } },
      source: { select: { name: true, url: true } },
      categories: { include: { category: { select: { name: true, slug: true } } } },
      tags: { include: { tag: { select: { name: true, slug: true } } } },
    },
  })

  if (!article) notFound()

  const related = await db.article.findMany({
    where: {
      status: 'PUBLISHED',
      contentType: 'GUIDE',
      slug: { not: params.slug },
      categories: {
        some: {
          categoryId: {
            in: article.categories.map((c) => c.categoryId),
          },
        },
      },
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
    select: { slug: true, title: true, excerpt: true, publishedAt: true },
  })

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Guías', href: '/guias' },
    { label: article.title },
  ]

  return (
    <>
      <ArticleJsonLd article={article as any} />
      <div className="container-editorial py-8 space-y-8">
        <Breadcrumb items={breadcrumbItems} />
        <ArticleHeader
          article={{
            title: article.title,
            excerpt: article.excerpt,
            publishedAt: article.publishedAt,
            author: article.author,
            categories: article.categories as any,
          }}
        />
        <ArticleBody html={article.body} />
        {related.length > 0 && <RelatedArticles articles={related} />}
      </div>
    </>
  )
}
