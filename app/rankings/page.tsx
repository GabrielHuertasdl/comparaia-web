import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { SITE_NAME } from '@/lib/constants/site'
import { RankingCard } from '@/components/rankings/RankingCard'
import Breadcrumb from '@/components/layout/Breadcrumb'
import PageHeader from '@/components/layout/PageHeader'

export const metadata: Metadata = {
  title: `Rankings de IA | ${SITE_NAME}`,
  description:
    'Rankings actualizados de los mejores modelos e IAs por caso de uso. Metodología transparente y datos verificados.',
  alternates: { canonical: 'https://comparaia.es/rankings' },
}

export default async function RankingsPage() {
  const rankings = await db.ranking.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' },
    include: {
      useCase: { select: { name: true } },
      models: {
        orderBy: { position: 'asc' },
        take: 3,
        include: {
          model: { select: { name: true, logoUrl: true } },
        },
      },
    },
  })

  return (
    <>
      <PageHeader
        title="Rankings de IA"
        description="Los mejores modelos de inteligencia artificial clasificados por caso de uso."
        badge="Rankings"
      />

      <div className="container-wide py-8 md:py-12">
        <Breadcrumb
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Rankings' },
          ]}
          className="mb-8"
        />

        {rankings.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rankings.map((ranking) => (
              <RankingCard
                key={ranking.slug}
                ranking={{
                  slug: ranking.slug,
                  title: ranking.title,
                  excerpt: ranking.excerpt,
                  useCase: ranking.useCase,
                  models: ranking.models.map((m) => ({
                    position: m.position,
                    model: { name: m.model.name, logoUrl: m.model.logoUrl },
                  })),
                }}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-16">
            No hay rankings publicados todavía.
          </p>
        )}
      </div>
    </>
  )
}
