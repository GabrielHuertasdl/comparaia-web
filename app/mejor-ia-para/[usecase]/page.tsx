import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { calculateMultipleScores } from '@/lib/scoring/engine'
import { buildUseCaseMeta } from '@/lib/seo/metadata'
import PageHeader from '@/components/layout/PageHeader'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { RankingTable } from '@/components/rankings/RankingTable'
import ItemListJsonLd from '@/components/seo/ItemListJsonLd'
import FAQJsonLd from '@/components/seo/FAQJsonLd'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import { AffiliateBox } from '@/components/monetization/AffiliateBox'
import Link from 'next/link'
import { USE_CASES } from '@/lib/constants/use-cases'
import { BASE_URL } from '@/lib/constants/site'

interface Props {
  params: { usecase: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const useCase = await db.useCase.findUnique({ where: { slug: params.usecase } })
  if (!useCase) return {}
  return buildUseCaseMeta(useCase)
}

export async function generateStaticParams() {
  return USE_CASES.map((uc) => ({ usecase: uc.slug }))
}

export const revalidate = 21600

export default async function MejorIAParaPage({ params }: Props) {
  const useCase = await db.useCase.findUnique({
    where: { slug: params.usecase },
    include: { criteria: true },
  })

  if (!useCase) notFound()

  const models = await db.aIModel.findMany({
    where: { status: { in: ['ACTIVE', 'BETA'] } },
    select: { id: true, name: true, developer: true, logoUrl: true, slug: true },
  })

  const scores = await calculateMultipleScores(
    models.map((m) => m.id),
    useCase.id
  )

  const rankedModels = scores
    .map((score, idx) => {
      const model = models.find((m) => m.id === score.modelId)!
      return { position: idx + 1, model, totalScore: score.totalScore, hasPlaceholders: score.hasPlaceholders }
    })
    .slice(0, 10)

  // Get affiliate links for top 3
  const top3Ids = rankedModels.slice(0, 3).map((r) => r.model.id)
  const affiliateLinks = await db.affiliateLink.findMany({
    where: { modelId: { in: top3Ids }, active: true },
    include: {
      model: { select: { id: true, name: true } },
      tool: { select: { name: true, tagline: true, logoUrl: true, hasFreeplan: true } },
    },
  })

  const year = new Date().getFullYear()
  const title = `Mejor IA para ${useCase.name} en ${year}`

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Rankings', href: '/rankings' },
    { label: title },
  ]

  const itemListItems = rankedModels.map((r) => ({
    name: r.model.name,
    url: `${BASE_URL}/herramientas/${r.model.slug}`,
    position: r.position,
  }))

  const faqs = [
    {
      question: `¿Cuál es la mejor IA para ${useCase.name}?`,
      answer: rankedModels[0]
        ? `Según nuestra metodología actualizada a ${year}, ${rankedModels[0].model.name} de ${rankedModels[0].model.developer} ocupa el primer puesto para ${useCase.name.toLowerCase()} con una puntuación de ${rankedModels[0].totalScore}/100. No obstante, la mejor opción depende de tus necesidades específicas, presupuesto y contexto de uso.`
        : `Analizamos las principales IAs del mercado para ${useCase.name.toLowerCase()}. Consulta nuestro ranking con datos verificados.`,
    },
    {
      question: '¿Cómo se calculan las puntuaciones?',
      answer: `Evaluamos cada modelo en función de criterios específicos para ${useCase.name.toLowerCase()}: ${useCase.criteria.map((c) => c.name).join(', ')}. Cada criterio tiene un peso basado en su importancia para este caso de uso. Ver metodología completa en /metodologia.`,
    },
    {
      question: '¿Con qué frecuencia se actualiza el ranking?',
      answer: 'Actualizamos los datos regularmente (mínimo cada 90 días por criterio). Cada puntuación muestra su fecha de verificación. Los datos desactualizados se señalan claramente.',
    },
  ]

  const breadcrumbJsonLd = [
    { name: 'Inicio', url: BASE_URL },
    { name: 'Rankings', url: `${BASE_URL}/rankings` },
    { name: title, url: `${BASE_URL}/mejor-ia-para/${params.usecase}` },
  ]

  return (
    <>
      <ItemListJsonLd items={itemListItems} />
      <FAQJsonLd items={faqs} />
      <BreadcrumbJsonLd items={breadcrumbJsonLd} />

      <div className="container-wide py-8 space-y-8">
        <Breadcrumb items={breadcrumbItems} />
        <PageHeader
          title={title}
          description={`Comparamos ${rankedModels.length} modelos de IA para ${useCase.description.toLowerCase()}. Datos verificados con metodología transparente.`}
          meta={[
            { label: 'Modelos evaluados', value: String(rankedModels.length) },
            { label: 'Actualizado', value: String(year) },
          ]}
        />

        {/* Top 3 affiliate boxes */}
        {affiliateLinks.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-semibold">Herramientas recomendadas</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {affiliateLinks.slice(0, 3).filter((link) => link.tool).length > 0 && (
                <AffiliateBox
                  models={affiliateLinks.slice(0, 3).filter((link) => link.tool).map((link) => ({
                    name: link.tool!.name,
                    logoUrl: link.tool!.logoUrl ?? null,
                    affiliateLinks: [{ slug: link.slug, destination: link.destination, partner: link.partner, active: true }],
                  }))}
                />
              )}
            </div>
          </section>
        )}

        {/* Main ranking table */}
        <section className="space-y-4">
          <h2 className="text-xl font-heading font-semibold">
            Ranking: mejor IA para {useCase.name.toLowerCase()}
          </h2>
          <RankingTable entries={rankedModels} />
        </section>

        {/* Criteria explanation */}
        <section className="border border-border rounded-lg p-6 space-y-3">
          <h2 className="font-heading font-semibold">Criterios de evaluación</h2>
          <ul className="space-y-2">
            {useCase.criteria.map((c) => (
              <li key={c.id} className="flex gap-3 text-sm">
                <span className="font-mono text-primary font-medium">
                  {Math.round(c.weight * 100)}%
                </span>
                <span>
                  <strong>{c.name}</strong>
                  {c.description && ` — ${c.description}`}
                </span>
              </li>
            ))}
          </ul>
          <Link href="/metodologia" className="text-sm text-primary hover:underline">
            Ver metodología completa →
          </Link>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <h2 className="text-xl font-heading font-semibold">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="border border-border rounded-lg p-4">
                <h3 className="font-medium mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="text-xs text-muted-foreground bg-muted/30 p-4 rounded-lg">
          Resultados orientativos basados en la metodología de ComparaIA. Las puntuaciones pueden
          variar según actualizaciones de los modelos. Algunos modelos pueden tener datos
          incompletos marcados con ⚠.
        </div>
      </div>
    </>
  )
}
