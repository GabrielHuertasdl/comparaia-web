import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { BASE_URL } from '@/lib/constants/site'
import { buildRankingMeta } from '@/lib/seo/metadata'
import Breadcrumb from '@/components/layout/Breadcrumb'
import PageHeader from '@/components/layout/PageHeader'
import { ArticleBody } from '@/components/editorial/ArticleBody'
import { RankingTable } from '@/components/rankings/RankingTable'
import ItemListJsonLd from '@/components/seo/ItemListJsonLd'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/lib/utils/format'

export const revalidate = 3600

interface PageProps {
  params: { slug: string }
}

async function getRanking(slug: string) {
  return db.ranking.findUnique({
    where: { slug },
    include: {
      useCase: true,
      models: {
        orderBy: { position: 'asc' },
        include: {
          model: {
            include: {
              scores: {
                include: { criteria: { select: { name: true, slug: true } } },
              },
            },
          },
        },
      },
    },
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const ranking = await getRanking(params.slug)
  if (!ranking) return {}
  return buildRankingMeta(ranking, ranking.useCase ?? undefined)
}

export async function generateStaticParams() {
  const rankings = await db.ranking.findMany({
    where: { publishedAt: { not: null } },
    select: { slug: true },
  })
  return rankings.map((r) => ({ slug: r.slug }))
}

export default async function RankingPage({ params }: PageProps) {
  const ranking = await getRanking(params.slug)
  if (!ranking || !ranking.publishedAt) notFound()

  const year = ranking.publishedAt.getFullYear()

  const itemListItems = ranking.models.map((entry) => ({
    name: entry.model.name,
    url: `${BASE_URL}/herramientas/${entry.model.slug}`,
    position: entry.position,
  }))

  return (
    <>
      <ItemListJsonLd items={itemListItems} />

      <PageHeader
        title={ranking.title}
        description={ranking.excerpt}
        badge={ranking.useCase?.name ?? 'Ranking'}
        meta={[
          { label: 'Año', value: String(year) },
          { label: 'Actualizado', value: formatDate(ranking.publishedAt) },
          { label: 'Modelos evaluados', value: String(ranking.models.length) },
        ]}
      />

      <div className="container-editorial py-8 md:py-12">
        <Breadcrumb
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Rankings', href: '/rankings' },
            { label: ranking.title },
          ]}
          className="mb-8"
        />

        <div className="space-y-10">
          {/* Ranking table */}
          <RankingTable
            entries={ranking.models.map((entry) => ({
              position: entry.position,
              totalScore: entry.totalScore,
              model: {
                slug: entry.model.slug,
                name: entry.model.name,
                developer: entry.model.developer,
                logoUrl: entry.model.logoUrl,
                scores: entry.model.scores
                  .filter(
                    (s) =>
                      ranking.useCase == null || s.useCaseId === ranking.useCase.id,
                  )
                  .map((s) => ({
                    criteriaId: s.criteriaId,
                    criteria: { name: s.criteria.name },
                    normalizedScore: s.normalizedScore,
                  })),
              },
            }))}
          />

          <Separator />

          {/* Methodology / body */}
          {ranking.body && (
            <section>
              <h2 className="text-2xl font-heading font-semibold mb-4">Metodología</h2>
              <ArticleBody html={ranking.body} />
            </section>
          )}
        </div>
      </div>
    </>
  )
}
