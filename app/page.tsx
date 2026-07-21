import Link from 'next/link'
import { ArrowRight, Code2, PenLine, Image, Video, Languages, BarChart3, type LucideIcon } from 'lucide-react'
import { db } from '@/lib/db'
import ArticleCard from '@/components/cards/ArticleCard'
import RankingCard from '@/components/cards/RankingCard'
import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/home/HeroSection'
import TopModelsSection from '@/components/home/TopModelsSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import NewsletterSection from '@/components/home/NewsletterSection'
import { ArticleStatus } from '@prisma/client'
import { USE_CASES } from '@/lib/constants/use-cases'

const HOME_USE_CASES = USE_CASES.slice(0, 6)

const ICON_MAP: Record<string, LucideIcon> = {
  Code2,
  PenLine,
  Image,
  Video,
  Languages,
  BarChart3,
}

export const revalidate = 3600

export default async function HomePage() {
  const [articles, rankings, topModels] = await Promise.all([
    db.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    }),

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

    db.aIModel.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { scores: { _count: 'desc' } },
      take: 4,
      include: { tool: { select: { slug: true } } },
    }),
  ])

  return (
    <>
      <Navigation />

      <main>
        <HeroSection />

        <TopModelsSection models={topModels} />

        {/* Rankings destacados */}
        {rankings.length > 0 && (
          <section className="py-20 bg-muted/15 border-t border-border/30">
            <div className="container-wide">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-sm font-medium text-primary mb-2">Actualizado regularmente</p>
                  <h2 className="font-heading text-3xl md:text-4xl font-bold">Rankings destacados</h2>
                </div>
                <Link
                  href="/rankings"
                  className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
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

        {/* Casos de uso */}
        <section className="py-20 bg-background border-t border-border/30">
          <div className="container-wide">
            <div className="text-center mb-12">
              <p className="text-sm font-medium text-primary mb-2">18+ categorías</p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold">¿Para qué necesitas IA?</h2>
              <p className="text-muted-foreground mt-3 max-w-md mx-auto text-balance">
                Encuentra la herramienta perfecta para cada tarea.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {HOME_USE_CASES.map((useCase) => {
                const Icon = ICON_MAP[useCase.iconName] ?? ArrowRight
                return (
                  <Link
                    key={useCase.slug}
                    href={`/mejor-ia-para/${useCase.slug}`}
                    className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 p-4
                      hover:border-primary/40 hover:bg-card hover:shadow-md hover:shadow-primary/5
                      transition-all duration-200"
                  >
                    <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl
                      bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {useCase.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {useCase.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/mejor-ia-para"
                className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
              >
                Ver todos los casos de uso <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <HowItWorksSection />

        <NewsletterSection />

        {/* Últimas noticias */}
        {articles.length > 0 && (
          <section className="py-20 bg-background border-t border-border/30">
            <div className="container-wide">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-sm font-medium text-primary mb-2">Noticias y análisis</p>
                  <h2 className="font-heading text-3xl md:text-4xl font-bold">Últimas novedades</h2>
                </div>
                <Link
                  href="/noticias"
                  className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Ver todo <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  )
}
