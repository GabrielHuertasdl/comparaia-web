import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import dynamic from 'next/dynamic'
import { USE_CASES } from '@/lib/constants/use-cases'

const ComparatorWizard = dynamic(
  () => import('@/components/comparator/ComparatorWizard'),
  { ssr: false, loading: () => <ComparatorSkeleton /> }
)

function ComparatorSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-muted rounded-lg w-48" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Comparador de IAs interactivo | ComparaIA',
  description:
    'Compara modelos de inteligencia artificial por caso de uso. Selecciona las IAs, elige tu necesidad y obtén un ranking personalizado con datos verificados.',
  openGraph: {
    title: 'Comparador de IAs | ComparaIA',
    description: 'Ranking personalizado de IAs según tu caso de uso',
  },
}

export default async function ComparadorPage() {
  const [models, useCases] = await Promise.all([
    db.aIModel.findMany({
      where: { status: { in: ['ACTIVE', 'BETA'] } },
      orderBy: [{ developer: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        developer: true,
        logoUrl: true,
        status: true,
        supportsCode: true,
        supportsVision: true,
      },
    }),
    db.useCase.findMany({
      orderBy: { name: 'asc' },
      include: {
        criteria: {
          select: { id: true, slug: true, name: true, weight: true, description: true },
          orderBy: { weight: 'desc' },
        },
      },
    }),
  ])

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Comparador' },
  ]

  return (
    <div className="container-wide py-8 space-y-8">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader
        title="Comparador de IAs"
        description="Selecciona los modelos que quieres comparar, elige tu caso de uso y obtén un ranking personalizado con datos verificados."
      />

      <div className="bg-muted/30 border border-border rounded-lg p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">Nota:</strong> Los resultados son orientativos y
        dependen de la metodología y los datos disponibles. Las puntuaciones tienen fecha de
        verificación.{' '}
        <a href="/metodologia" className="text-primary hover:underline">
          Ver metodología completa →
        </a>
      </div>

      <ComparatorWizard models={models as any} useCases={useCases as any} />
    </div>
  )
}
