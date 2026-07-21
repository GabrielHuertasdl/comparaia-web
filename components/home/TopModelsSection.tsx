import Link from 'next/link'
import Image from 'next/image'
import { Cpu, ArrowRight } from 'lucide-react'

type TopModel = {
  id: string
  name: string
  developer: string
  logoUrl: string | null
  slug: string
  tool: { slug: string } | null
}

interface Props {
  models: TopModel[]
}

export default function TopModelsSection({ models }: Props) {
  if (models.length === 0) return null

  return (
    <section className="py-20 bg-background border-t border-border/30">
      <div className="container-wide">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-medium text-primary mb-2">Rankings actualizados</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold">Las IAs más destacadas</h2>
          </div>
          <Link
            href="/rankings"
            className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Ver rankings <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {models.map((model, i) => (
            <Link
              key={model.id}
              href={model.tool ? `/herramientas/${model.tool.slug}` : `/herramientas`}
              className="group rounded-2xl border border-border/60 bg-card p-5 md:p-6
                hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5
                transition-all duration-200"
            >
              <p className="text-xs font-mono text-muted-foreground mb-4">#{i + 1}</p>
              {model.logoUrl ? (
                <Image
                  src={model.logoUrl}
                  alt={model.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-xl object-contain border border-border/50"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-muted border border-border/50 flex items-center justify-center">
                  <Cpu className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <p className="font-heading font-semibold text-sm mt-3 group-hover:text-primary transition-colors leading-tight">
                {model.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{model.developer}</p>
            </Link>
          ))}
        </div>

        <div className="sm:hidden mt-6 text-center">
          <Link href="/rankings" className="text-sm text-primary font-medium inline-flex items-center gap-1">
            Ver todos los rankings <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
