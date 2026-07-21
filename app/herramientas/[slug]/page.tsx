import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PageHeader from '@/components/layout/PageHeader'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { ToolHeader } from '@/components/tools/ToolHeader'
import { ToolPricingTable } from '@/components/tools/ToolPricingTable'
import { AffiliateBox } from '@/components/monetization/AffiliateBox'
import SoftwareAppJsonLd from '@/components/seo/SoftwareAppJsonLd'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import { AffiliateDisclosure } from '@/components/legal/AffiliateDisclosure'
import { buildToolMeta } from '@/lib/seo/metadata'
import Link from 'next/link'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = await db.aITool.findUnique({ where: { slug: params.slug } })
  if (!tool) return {}
  return buildToolMeta(tool)
}

export async function generateStaticParams() {
  const tools = await db.aITool.findMany({ select: { slug: true } })
  return tools.map((t) => ({ slug: t.slug }))
}

export const revalidate = 86400

export default async function HerramientaPage({ params }: Props) {
  const tool = await db.aITool.findUnique({
    where: { slug: params.slug },
    include: {
      model: {
        include: {
          scores: {
            include: { useCase: true, criteria: true },
          },
        },
      },
      affiliateLinks: { where: { active: true }, take: 1 },
      categories: { include: { category: true } },
    },
  })

  if (!tool) notFound()

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Herramientas', href: '/herramientas' },
    { label: tool.name },
  ]

  const affiliate = tool.affiliateLinks[0] ?? null

  // Group scores by use case
  const scoresByUseCase = tool.model?.scores
    ? tool.model.scores.reduce(
        (acc, score) => {
          const ucId = score.useCaseId
          if (!acc[ucId]) {
            acc[ucId] = { useCase: score.useCase, scores: [] }
          }
          acc[ucId].scores.push(score)
          return acc
        },
        {} as Record<string, { useCase: typeof tool.model.scores[0]['useCase']; scores: typeof tool.model.scores }>
      )
    : {}

  const seoJsonLd = {
    name: tool.name,
    description: tool.description,
    websiteUrl: tool.websiteUrl,
    startingPrice: tool.startingPrice,
    hasFreeplan: tool.hasFreeplan,
  }

  const breadcrumbJsonLd = [
    { name: 'Inicio', url: 'https://comparaia.es' },
    { name: 'Herramientas', url: 'https://comparaia.es/herramientas' },
    { name: tool.name, url: `https://comparaia.es/herramientas/${tool.slug}` },
  ]

  return (
    <>
      <SoftwareAppJsonLd tool={seoJsonLd} />
      <BreadcrumbJsonLd items={breadcrumbJsonLd} />

      <div className="container-wide py-8 space-y-8">
        <Breadcrumb items={breadcrumbItems} />

        <ToolHeader tool={tool} />

        {affiliate && (
          <div className="max-w-2xl">
            <AffiliateBox
              models={[{
                name: tool.name,
                logoUrl: tool.logoUrl,
                affiliateLinks: [{ slug: affiliate.slug, destination: affiliate.destination, partner: affiliate.partner, active: true }],
              }]}
            />
          </div>
        )}

        <ToolPricingTable
          pricingModel={tool.pricingModel}
          startingPrice={tool.startingPrice}
          hasFreeplan={tool.hasFreeplan}
          trialDays={tool.trialDays}
        />

        {tool.model && Object.keys(scoresByUseCase).length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-heading font-semibold">Puntuaciones por caso de uso</h2>
            <p className="text-sm text-muted-foreground">
              Basadas en nuestra metodología. Ver{' '}
              <Link href="/metodologia" className="text-primary hover:underline">
                metodología completa
              </Link>
              .
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {Object.values(scoresByUseCase).map(({ useCase, scores }) => {
                const avgScore =
                  scores.reduce((s, r) => s + (r.normalizedScore ?? 5), 0) / scores.length
                return (
                  <div key={useCase.id} className="border border-border rounded-lg p-4">
                    <h3 className="font-medium text-sm mb-2">{useCase.name}</h3>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-mono font-bold">
                        {(avgScore * 10).toFixed(0)}
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-muted rounded-full">
                          <div
                            className="h-2 bg-primary rounded-full"
                            style={{ width: `${avgScore * 10}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/mejor-ia-para/${useCase.slug}`}
                      className="text-xs text-primary hover:underline mt-2 inline-block"
                    >
                      Ver ranking completo →
                    </Link>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <div className="bg-muted/30 border border-border rounded-lg p-4 text-sm text-muted-foreground">
          Las puntuaciones se actualizan periódicamente. Los datos tienen fecha de verificación.
          Precios y funciones pueden variar.{' '}
          <Link href="/metodologia" className="text-primary hover:underline">
            Ver metodología →
          </Link>
        </div>

        <AffiliateDisclosure />
      </div>
    </>
  )
}
