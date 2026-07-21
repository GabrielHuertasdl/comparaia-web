import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { db } from '@/lib/db'
import { buildComparisonMeta } from '@/lib/seo/metadata'
import Breadcrumb from '@/components/layout/Breadcrumb'
import PageHeader from '@/components/layout/PageHeader'
import { ArticleBody } from '@/components/editorial/ArticleBody'
import { ComparisonTable } from '@/components/comparisons/ComparisonTable'
import { ComparisonCard } from '@/components/comparisons/ComparisonCard'
import { Separator } from '@/components/ui/separator'

export const revalidate = 86400

interface PageProps {
  params: { slug: string }
}

async function getComparison(slug: string) {
  return db.comparison.findUnique({
    where: { slug },
    include: {
      models: {
        orderBy: { displayOrder: 'asc' },
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
  const comparison = await getComparison(params.slug)
  if (!comparison) return {}
  return buildComparisonMeta({
    ...comparison,
    models: comparison.models.map((m) => ({ model: { name: m.model.name } })),
  })
}

export async function generateStaticParams() {
  const comparisons = await db.comparison.findMany({
    where: { publishedAt: { not: null } },
    select: { slug: true },
  })
  return comparisons.map((c) => ({ slug: c.slug }))
}

export default async function ComparativaPage({ params }: PageProps) {
  const comparison = await getComparison(params.slug)
  if (!comparison || !comparison.publishedAt) notFound()

  const relatedComparisons = await db.comparison.findMany({
    where: { publishedAt: { not: null }, slug: { not: comparison.slug } },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    include: {
      models: {
        include: { model: { select: { name: true, logoUrl: true } } },
        orderBy: { displayOrder: 'asc' },
      },
    },
  })

  const modelNames = comparison.models.map((m) => m.model.name).join(' vs ')

  return (
    <>
      <PageHeader
        title={comparison.title}
        description={comparison.excerpt}
        badge="Comparativa"
      />

      <div className="container-editorial py-8 md:py-12">
        <Breadcrumb
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Comparativas', href: '/comparativas' },
            { label: comparison.title },
          ]}
          className="mb-8"
        />

        {/* ComparisonHero */}
        {comparison.models.length >= 2 && (
          <div className="flex items-center justify-center gap-6 py-8 mb-8 rounded-xl bg-muted/40 border border-border">
            {comparison.models.map(({ model }, index) => (
              <div key={model.id} className="flex items-center gap-6">
                {index > 0 && (
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-sm shrink-0">
                    VS
                  </div>
                )}
                <div className="flex flex-col items-center gap-2 text-center">
                  {model.logoUrl && (
                    <Image
                      src={model.logoUrl}
                      alt={model.name}
                      width={56}
                      height={56}
                      className="rounded-xl object-contain"
                    />
                  )}
                  <div>
                    <p className="font-heading font-semibold text-lg">{model.name}</p>
                    <p className="text-sm text-muted-foreground">{model.developer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-10">
          {/* Body content */}
          <ArticleBody html={comparison.body} />

          <Separator />

          {/* Comparison table */}
          <section>
            <h2 className="text-2xl font-heading font-semibold mb-4">
              Comparativa de características
            </h2>
            <ComparisonTable models={comparison.models} />
          </section>

          {/* Related comparisons */}
          {relatedComparisons.length > 0 && (
            <>
              <Separator />
              <section>
                <h2 className="text-xl font-heading font-semibold mb-4">
                  Otras comparativas
                </h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {relatedComparisons.map((c) => (
                    <ComparisonCard key={c.slug} comparison={c} />
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </>
  )
}
