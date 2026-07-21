import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { SITE_NAME } from '@/lib/constants/site'
import { ComparisonCard } from '@/components/comparisons/ComparisonCard'
import Breadcrumb from '@/components/layout/Breadcrumb'
import PageHeader from '@/components/layout/PageHeader'

export const metadata: Metadata = {
  title: `Comparativas de herramientas IA | ${SITE_NAME}`,
  description:
    'Comparativas en profundidad de las principales herramientas e IAs del mercado. Análisis objetivo con datos verificados.',
  alternates: { canonical: 'https://comparaia.es/comparativas' },
}

export default async function ComparativasPage() {
  const comparisons = await db.comparison.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' },
    include: {
      models: {
        include: { model: { select: { name: true, logoUrl: true } } },
        orderBy: { displayOrder: 'asc' },
      },
    },
  })

  return (
    <>
      <PageHeader
        title="Comparativas de herramientas IA"
        description="Análisis en profundidad frente a frente de los modelos e IAs más relevantes."
        badge="Comparativas"
      />

      <div className="container-wide py-8 md:py-12">
        <Breadcrumb
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Comparativas' },
          ]}
          className="mb-8"
        />

        {comparisons.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {comparisons.map((comparison) => (
              <ComparisonCard key={comparison.slug} comparison={comparison} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-16">
            No hay comparativas publicadas todavía.
          </p>
        )}
      </div>
    </>
  )
}
