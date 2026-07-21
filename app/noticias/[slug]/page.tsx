import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { ArticleStatus, ContentType } from '@prisma/client'
import { buildArticleMeta } from '@/lib/seo/metadata'
import { ArticleHeader } from '@/components/editorial/ArticleHeader'
import { ArticleBody } from '@/components/editorial/ArticleBody'
import { RelatedArticles } from '@/components/editorial/RelatedArticles'
import Breadcrumb from '@/components/layout/Breadcrumb'
import ArticleJsonLd from '@/components/seo/ArticleJsonLd'
import { AffiliateBox } from '@/components/monetization/AffiliateBox'
import { Separator } from '@/components/ui/separator'

export const revalidate = 3600

interface PageProps {
  params: { slug: string }
}

async function getArticle(slug: string) {
  return db.article.findFirst({
    where: { slug, status: ArticleStatus.PUBLISHED },
    include: {
      author: { select: { name: true } },
      source: { select: { name: true } },
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      mentionedModels: {
        include: {
          model: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              affiliateLinks: {
                where: { active: true },
                select: { slug: true, destination: true, partner: true, active: true },
              },
            },
          },
        },
      },
    },
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await getArticle(params.slug)
  if (!article) return {}
  return buildArticleMeta({
    ...article,
    tags: article.tags.map((t) => ({ tag: { name: t.tag.name } })),
  })
}

export async function generateStaticParams() {
  const articles = await db.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    orderBy: { publishedAt: 'desc' },
    take: 100,
    select: { slug: true },
  })
  return articles.map((a) => ({ slug: a.slug }))
}

export default async function ArticlePage({ params }: PageProps) {
  const article = await getArticle(params.slug)
  if (!article) notFound()

  const categoryIds = article.categories.map((c) => c.categoryId)

  const relatedArticles = await db.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      contentType: ContentType.NEWS,
      slug: { not: article.slug },
      ...(categoryIds.length > 0
        ? { categories: { some: { categoryId: { in: categoryIds } } } }
        : {}),
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      publishedAt: true,
    },
  })

  const mentionedModels = article.mentionedModels.map((m) => m.model)

  return (
    <>
      <ArticleJsonLd
        article={{
          title: article.title,
          excerpt: article.excerpt,
          publishedAt: article.publishedAt,
          slug: article.slug,
          author: article.author,
        }}
      />

      <div className="container-wide py-8 md:py-12">
        <Breadcrumb
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Noticias', href: '/noticias' },
            { label: article.title },
          ]}
          className="mb-6"
        />

        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-10 xl:gap-14">
          {/* Main */}
          <main className="min-w-0 space-y-8">
            <ArticleHeader
              article={{
                title: article.title,
                excerpt: article.excerpt,
                publishedAt: article.publishedAt,
                author: article.author,
                categories: article.categories.map((c) => ({
                  category: { name: c.category.name, slug: c.category.slug },
                })),
                tags: article.tags.map((t) => ({
                  tag: { name: t.tag.name, slug: t.tag.slug },
                })),
              }}
            />

            <ArticleBody html={article.body} />

            {/* Source attribution */}
            {article.sourceUrl && (
              <p className="text-sm text-muted-foreground border-l-2 border-border pl-4">
                Fuente:{' '}
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground underline underline-offset-2 transition-colors"
                >
                  {article.source?.name ?? article.sourceUrl}
                </a>
              </p>
            )}

            <Separator />

            <RelatedArticles articles={relatedArticles} />
          </main>

          {/* Sidebar */}
          <aside className="hidden lg:block space-y-6 mt-0">
            <AffiliateBox models={mentionedModels} />
          </aside>
        </div>
      </div>
    </>
  )
}
