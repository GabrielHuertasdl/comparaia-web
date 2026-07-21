import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { ArticleStatus, ContentType } from '@prisma/client'
import { SITE_NAME } from '@/lib/constants/site'
import { ArticleGrid } from '@/components/editorial/ArticleGrid'
import Breadcrumb from '@/components/layout/Breadcrumb'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'

const PAGE_SIZE = 12

interface PageProps {
  params: { slug: string }
  searchParams: { page?: string }
}

async function getCategory(slug: string) {
  return db.category.findUnique({ where: { slug } })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = await getCategory(params.slug)
  if (!category) return {}
  return {
    title: `Noticias sobre ${category.name} | ${SITE_NAME}`,
    description:
      category.description ??
      `Las últimas noticias sobre ${category.name} en el mundo de la inteligencia artificial.`,
    alternates: { canonical: `https://comparaia.es/noticias/categoria/${category.slug}` },
  }
}

export async function generateStaticParams() {
  const categories = await db.category.findMany({ select: { slug: true } })
  return categories.map((c) => ({ slug: c.slug }))
}

export default async function CategoriaPage({ params, searchParams }: PageProps) {
  const category = await getCategory(params.slug)
  if (!category) notFound()

  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const skip = (page - 1) * PAGE_SIZE

  const [articles, total] = await Promise.all([
    db.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        contentType: ContentType.NEWS,
        categories: { some: { categoryId: category.id } },
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: PAGE_SIZE,
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        source: { select: { name: true } },
      },
    }),
    db.article.count({
      where: {
        status: ArticleStatus.PUBLISHED,
        contentType: ContentType.NEWS,
        categories: { some: { categoryId: category.id } },
      },
    }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const hasPrev = page > 1
  const hasNext = page < totalPages

  return (
    <>
      <PageHeader
        title={category.name}
        description={
          category.description ?? `Noticias sobre ${category.name} en inteligencia artificial.`
        }
        badge="Categoría"
      />

      <div className="container-wide py-8 md:py-12">
        <Breadcrumb
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Noticias', href: '/noticias' },
            { label: category.name },
          ]}
          className="mb-6"
        />

        {articles.length > 0 ? (
          <ArticleGrid articles={articles} />
        ) : (
          <p className="text-muted-foreground text-center py-16">
            No hay noticias en esta categoría todavía.
          </p>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Paginación"
            className="flex items-center justify-between mt-10 pt-6 border-t border-border"
          >
            <Button asChild variant="outline" disabled={!hasPrev}>
              {hasPrev ? (
                <Link href={`/noticias/categoria/${category.slug}?page=${page - 1}`}>
                  ← Anterior
                </Link>
              ) : (
                <span>← Anterior</span>
              )}
            </Button>

            <span className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </span>

            <Button asChild variant="outline" disabled={!hasNext}>
              {hasNext ? (
                <Link href={`/noticias/categoria/${category.slug}?page=${page + 1}`}>
                  Siguiente →
                </Link>
              ) : (
                <span>Siguiente →</span>
              )}
            </Button>
          </nav>
        )}
      </div>
    </>
  )
}
