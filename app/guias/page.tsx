import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { ArticleGrid } from '@/components/editorial/ArticleGrid'
import { SITE_NAME } from '@/lib/constants/site'
import Link from 'next/link'

export const metadata: Metadata = {
  title: `Guías de inteligencia artificial | ${SITE_NAME}`,
  description:
    'Guías prácticas y evergreen sobre herramientas y modelos de inteligencia artificial. Aprende a elegir la mejor IA para cada tarea.',
}

export default async function GuiasPage() {
  const guides = await db.article.findMany({
    where: { status: 'PUBLISHED', contentType: 'GUIDE' },
    orderBy: { publishedAt: 'desc' },
    take: 24,
    include: {
      categories: { include: { category: { select: { name: true, slug: true } } } },
      tags: { include: { tag: true } },
    },
  })

  const breadcrumbItems = [{ label: 'Inicio', href: '/' }, { label: 'Guías' }]

  return (
    <div className="container-wide py-8 space-y-8">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader
        title="Guías de IA"
        description="Recursos prácticos y análisis en profundidad sobre herramientas de inteligencia artificial."
        meta={[{ label: 'Artículos', value: String(guides.length) }]}
      />

      {guides.length > 0 ? (
        <ArticleGrid articles={guides as any} />
      ) : (
        <div className="text-center py-16 text-muted-foreground space-y-4">
          <p>No hay guías publicadas todavía.</p>
          <Link href="/noticias" className="text-primary hover:underline">
            Ver noticias →
          </Link>
        </div>
      )}
    </div>
  )
}
