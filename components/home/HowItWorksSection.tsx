import Link from 'next/link'
import { Database, SlidersHorizontal, RefreshCw, ArrowRight } from 'lucide-react'

const STEPS = [
  {
    icon: Database,
    label: 'Paso 01',
    title: 'Recopilamos datos verificados',
    description:
      'Evaluamos cada IA con criterios objetivos: benchmarks, precios actuales y capacidades reales.',
  },
  {
    icon: SlidersHorizontal,
    label: 'Paso 02',
    title: 'Aplicamos nuestra metodología',
    description:
      'Cada puntuación se calcula con pesos por caso de uso. Indicamos el nivel de confianza de cada dato.',
  },
  {
    icon: RefreshCw,
    label: 'Paso 03',
    title: 'Publicamos y actualizamos',
    description:
      'Rankings revisados periódicamente. Cada cambio de modelo o precio queda registrado con fecha.',
  },
]

export default function HowItWorksSection() {
  return (
    <section className="py-24 bg-muted/15 border-t border-border/30">
      <div className="container-wide">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3">Metodología transparente</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold">
            ¿Cómo funciona ComparaIA?
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-balance">
            Datos objetivos, criterios claros y actualizaciones constantes para que siempre elijas bien.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Connector line desktop */}
          <div
            className="hidden md:block absolute top-7 border-t border-dashed border-border/50 z-0"
            style={{ left: 'calc(33.33% + 1.5rem)', right: 'calc(33.33% + 1.5rem)' }}
            aria-hidden
          />

          {STEPS.map(({ icon: Icon, label, title, description }) => (
            <div key={label} className="relative z-10 flex flex-col gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-2">
                <Icon className="h-7 w-7 text-primary" />
              </div>
              <p className="text-xs font-mono text-muted-foreground tracking-[0.15em] uppercase">
                {label}
              </p>
              <h3 className="font-heading font-semibold text-lg leading-tight">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/metodologia"
            className="inline-flex items-center gap-1 hover:gap-2 transition-all text-sm text-primary font-medium"
          >
            Leer metodología completa <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
