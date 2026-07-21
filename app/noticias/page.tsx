import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { ArticleStatus, ContentType } from '@prisma/client'
import { ArticleGrid } from '@/components/editorial/ArticleGrid'
import Breadcrumb from '@/components/layout/Breadcrumb'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const PAGE_SIZE = 12

export const metadata: Metadata = {
  title: 'Noticias sobre inteligencia artificial | ComparaIA',
  description:
    'Las últimas noticias sobre inteligencia artificial, modelos de lenguaje, herramientas de IA y tendencias del sector. Actualizadas a diario.',
  alternates: { canonical: 'https://comparaia.es/noticias' },
}

interface PageProps {
  searchParams: { page?: string; categoria?: string }
}

export default async function NoticiasPage({ searchParams }: PageProps) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const skip = (page - 1) * PAGE_SIZE

  const [articles, total, categories] = await Promise.all([
    db.article.findMany({
      where: { status: ArticleStatus.PUBLISHED, contentType: ContentType.NEWS },
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
      where: { status: ArticleStatus.PUBLISHED, contentType: ContentType.NEWS },
    }),
    db.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const hasPrev = page > 1
  const hasNext = page < totalPages

  return (
    <>
      <PageHeader
        title="Noticias de IA"
        description="Las últimas noticias sobre inteligencia artificial, modelos y herramientas."
        badge="Noticias"
      />

      <div className="container-wide py-8 md:py-12">
        <Breadcrumb
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Noticias' },
          ]}
          className="mb-6"
        />

        {/* Category filter chips */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link href="/noticias">
              <Badge
                variant={!searchParams.categoria ? 'default' : 'outline'}
                className="cursor-pointer text-sm"
              >
                Todas
              </Badge>
            </Link>
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/noticias/categoria/${cat.slug}`}>
                <Badge variant="outline" className="cursor-pointer text-sm">
                  {cat.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {articles.length > 0 ? (
          <ArticleGrid articles={articles} />
        ) : (
          <p className="text-muted-foreground text-center py-16">
            No hay noticias publicadas todavía.
          </p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            aria-label="Paginación"
            className="flex items-center justify-between mt-10 pt-6 border-t border-border"
          >
            <Button asChild variant="outline" disabled={!hasPrev}>
              {hasPrev ? (
                <Link href={`/noticias?page=${page - 1}`}>← Anterior</Link>
              ) : (
                <span>← Anterior</span>
              )}
            </Button>

            <span className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </span>

            <Button asChild variant="outline" disabled={!hasNext}>
              {hasNext ? (
                <Link href={`/noticias?page=${page + 1}`}>Siguiente →</Link>
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
