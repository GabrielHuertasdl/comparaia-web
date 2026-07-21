import Link from 'next/link'
import { ArrowRight, Code2, PenLine, Image, Video, Languages, BarChart3, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/db'
import ArticleCard from '@/components/cards/ArticleCard'
import RankingCard from '@/components/cards/RankingCard'
import ComparisonCard from '@/components/cards/ComparisonCard'
import NewsletterSignup from '@/components/shared/NewsletterSignup'
import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import { ArticleStatus } from '@prisma/client'
import { USE_CASES } from '@/lib/constants/use-cases'

// The 6 use cases shown in the quick-link grid
const HOME_USE_CASES = USE_CASES.slice(0, 6)

// Icon map for use cases shown on home
const ICON_MAP: Record<string, LucideIcon> = {
  Code2,
  PenLine,
  Image,
  Video,
  Languages,
  BarChart3,
}

export const revalidate = 3600 // ISR: rebuild at most once per hour

export default async function HomePage() {
  const [articles, rankings, comparisons, topModels] = await Promise.all([
    // Latest 6 published articles
    db.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      orderBy: { publishedAt: 'desc' },
      take: 6,
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    }),

    // Latest 3 rankings with useCase + top 3 models
    db.ranking.findMany({
      where: { publishedAt: { not: null } },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      include: {
        useCase: true,
        models: {
          orderBy: { position: 'asc' },
          take: 3,
          include: { model: true },
        },
      },
    }),

    // Latest 3 comparisons with models
    db.comparison.findMany({
      where: { publishedAt: { not: null } },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      include: {
        models: {
          orderBy: { displayOrder: 'asc' },
          include: { model: true },
        },
      },
    }),

    // Top 4 AI models (most scores, as a proxy for best-reviewed)
    db.aIModel.findMany({
      take: 4,
      include: { tool: true },
    }),
  ])

  return (
    <>
      <Navigation />

      <main>
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 md:py-28">
          <div className="container-wide text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary font-medium mb-6">
              Análisis independiente · Sin financiación de fabricantes
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-bold tracking-tight text-balance mb-6">
              Compara las IAs{' '}
              <span className="text-primary">con datos reales</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance">
              Rankings actualizados, comparativas detalladas y análisis de herramientas de IA.
              Todo con metodología transparente y datos verificados.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <Link href="/comparador">
                  Comparar ahora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                <Link href="/rankings">Ver rankings</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Últimas noticias ───────────────────────────────────────────── */}
        {articles.length > 0 && (
          <section className="py-16 bg-background">
            <div className="container-wide">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-heading text-2xl md:text-3xl font-bold">
                  Últimas noticias
                </h2>
                <Link
                  href="/noticias"
                  className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Ver todas <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.slice(0, 6).map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Rankings destacados ────────────────────────────────────────── */}
        {rankings.length > 0 && (
          <section className="py-16 bg-muted/30">
            <div className="container-wide">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-heading text-2xl md:text-3xl font-bold">
                  Rankings destacados
                </h2>
                <Link
                  href="/rankings"
                  className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Ver todos <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {rankings.map((ranking) => (
                  <RankingCard key={ranking.id} ranking={ranking} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Comparativas recientes ─────────────────────────────────────── */}
        {comparisons.length > 0 && (
          <section className="py-16 bg-background">
            <div className="container-wide">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-heading text-2xl md:text-3xl font-bold">
                  Comparativas recientes
                </h2>
                <Link
                  href="/comparativas"
                  className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Ver todas <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {comparisons.map((comparison) => (
                  <ComparisonCard key={comparison.id} comparison={comparison} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Mejores IAs para… ──────────────────────────────────────────── */}
        <section className="py-16 bg-muted/30">
          <div className="container-wide">
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3">
              Mejores IAs para…
            </h2>
            <p className="text-muted-foreground mb-8">
              Encuentra la IA perfecta para cada tarea.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {HOME_USE_CASES.map((useCase) => {
                const Icon = ICON_MAP[useCase.iconName] ?? ArrowRight
                return (
                  <Link
                    key={useCase.slug}
                    href={`/mejor-ia-para/${useCase.slug}`}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all group"
                  >
                    <span className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {useCase.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{useCase.description}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/mejor-ia-para"
                className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
              >
                Ver todos los casos de uso <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Newsletter ─────────────────────────────────────────────────── */}
        <section className="py-20 bg-background border-t border-border">
          <div className="container-editorial">
            <NewsletterSignup variant="hero" />
          </div>
        </section>

        {/* ── Cómo funciona ─────────────────────────────────────────────── */}
        <section className="py-16 bg-muted/30 border-t border-border">
          <div className="container-wide">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-12">
              ¿Cómo funciona ComparaIA?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '1',
                  title: 'Recopilamos datos verificados',
                  description:
                    'Nuestro equipo editorial evalúa cada herramienta de IA con criterios objetivos: rendimiento en benchmarks, precios actuales, capacidades reales y actualizaciones de modelos.',
                },
                {
                  step: '2',
                  title: 'Aplicamos nuestra metodología',
                  description:
                    'Cada puntuación se calcula con pesos ponderados por caso de uso. Indicamos el nivel de confianza de cada dato: verificado, estimado o con datos de la comunidad.',
                },
                {
                  step: '3',
                  title: 'Publicamos y actualizamos',
                  description:
                    'Rankings y comparativas se revisan periódicamente. Cuando un modelo se actualiza o cambian los precios, actualizamos la información y registramos la fecha de revisión.',
                },
              ].map(({ step, title, description }) => (
                <div key={step} className="flex flex-col gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-heading font-bold text-xl">
                    {step}
                  </div>
                  <h3 className="font-heading font-semibold text-lg">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/metodologia"
                className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
              >
                Leer metodología completa <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
