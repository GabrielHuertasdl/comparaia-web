import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background min-h-[92vh] flex items-center">
      {/* Glow layer */}
      <div className="absolute inset-0 bg-hero-glow animate-glow-pulse pointer-events-none" aria-hidden />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 bg-grid opacity-40 pointer-events-none"
        style={{
          maskImage: 'radial-gradient(ellipse 70% 65% at 50% 0%, black 50%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 65% at 50% 0%, black 50%, transparent 100%)',
        }}
        aria-hidden
      />

      {/* Content */}
      <div className="container-wide relative z-10 py-28 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          Análisis independiente · Sin financiación de fabricantes
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-heading font-bold tracking-tight leading-[1.08] text-balance mb-6">
          Compara las IAs{' '}
          <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            que necesitas
          </span>
          , en español
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed mb-10">
          Rankings actualizados, comparativas detalladas y análisis de herramientas de IA.
          Todo con metodología transparente y datos verificados.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
          <Button asChild size="lg" className="h-12 px-8 text-base font-semibold shadow-glow transition-shadow">
            <Link href="/comparador">
              Comparar ahora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 px-8 text-base border-border/60 hover:border-primary/50"
          >
            <Link href="/rankings">Ver rankings</Link>
          </Button>
        </div>

        {/* Stats row */}
        <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-sm text-muted-foreground">
          <div className="flex flex-col items-center sm:items-start">
            <span className="font-semibold text-foreground text-base">+50</span>
            modelos analizados
          </div>
          <div className="hidden sm:block w-px h-4 bg-border/40" aria-hidden />
          <div className="flex flex-col items-center sm:items-start">
            <span className="font-semibold text-foreground text-base">100%</span>
            independiente
          </div>
          <div className="hidden sm:block w-px h-4 bg-border/40" aria-hidden />
          <div className="flex flex-col items-center sm:items-start">
            Actualizado{' '}
            <span className="font-semibold text-foreground text-base">semanalmente</span>
          </div>
        </div>
      </div>
    </section>
  )
}
