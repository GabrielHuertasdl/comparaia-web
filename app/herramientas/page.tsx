import type { Metadata } from 'next'
import { db } from '@/lib/db'
import PageHeader from '@/components/layout/PageHeader'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { ToolCard } from '@/components/tools/ToolCard'
import { SITE_NAME } from '@/lib/constants/site'

export const metadata: Metadata = {
  title: `Directorio de herramientas de IA | ${SITE_NAME}`,
  description:
    'Directorio completo de herramientas y aplicaciones de inteligencia artificial. Comparativa de precios, funciones y casos de uso.',
}

export const revalidate = 3600

export default async function HerramientasPage() {
  const tools = await db.aITool.findMany({
    orderBy: { name: 'asc' },
    include: {
      model: { select: { name: true } },
      affiliateLinks: { where: { active: true }, select: { slug: true }, take: 1 },
      categories: { include: { category: { select: { name: true, slug: true } } } },
    },
  })

  const breadcrumbItems = [{ label: 'Inicio', href: '/' }, { label: 'Herramientas' }]

  return (
    <div className="container-wide py-8 space-y-8">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader
        title="Herramientas de IA"
        description="Directorio de las principales herramientas de inteligencia artificial. Comparamos precios, funciones y rendimiento."
        meta={[{ label: 'Herramientas', value: String(tools.length) }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={{
              slug: tool.slug,
              name: tool.name,
              tagline: tool.tagline,
              logoUrl: tool.logoUrl,
              pricingModel: tool.pricingModel,
              startingPrice: tool.startingPrice,
              hasFreeplan: tool.hasFreeplan,
            }}
            hasAffiliate={tool.affiliateLinks.length > 0}
          />
        ))}
      </div>

      {tools.length === 0 && (
        <p className="text-center text-muted-foreground py-16">
          No hay herramientas registradas todavía.
        </p>
      )}
    </div>
  )
}
