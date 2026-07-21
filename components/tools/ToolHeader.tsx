import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils/format'

const PRICING_LABELS: Record<string, string> = {
  FREE: 'Gratis',
  FREEMIUM: 'Freemium',
  SUBSCRIPTION: 'Suscripción',
  USAGE_BASED: 'Pago por uso',
  ONE_TIME: 'Pago único',
  ENTERPRISE: 'Empresa',
}

interface ToolHeaderProps {
  tool: {
    name: string
    tagline: string
    logoUrl?: string | null
    websiteUrl?: string | null
    pricingModel: string
    startingPrice?: number | null
    hasFreeplan: boolean
    trialDays?: number | null
  }
}

export function ToolHeader({ tool }: ToolHeaderProps) {
  const pricingLabel = PRICING_LABELS[tool.pricingModel] ?? tool.pricingModel

  return (
    <div className="flex flex-col sm:flex-row gap-5 items-start">
      {tool.logoUrl ? (
        <Image
          src={tool.logoUrl}
          alt={tool.name}
          width={60}
          height={60}
          className="rounded-xl object-contain border border-border shrink-0"
        />
      ) : (
        <div className="w-[60px] h-[60px] rounded-xl bg-muted shrink-0" />
      )}

      <div className="flex-1 min-w-0 space-y-2">
        <h1 className="font-heading text-3xl font-bold leading-tight">{tool.name}</h1>
        <p className="text-muted-foreground text-lg leading-snug">{tool.tagline}</p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {pricingLabel}
          </Badge>

          {tool.hasFreeplan && tool.pricingModel !== 'FREE' && (
            <Badge variant="outline" className="text-sm px-3 py-1">
              Plan gratuito disponible
            </Badge>
          )}

          {tool.startingPrice != null && tool.startingPrice > 0 && (
            <span className="text-sm text-muted-foreground">
              desde{' '}
              <span className="font-semibold text-foreground">
                {formatPrice(tool.startingPrice)}/mes
              </span>
            </span>
          )}

          {tool.trialDays != null && tool.trialDays > 0 && (
            <span className="text-sm text-muted-foreground">
              Prueba gratuita de <span className="font-semibold text-foreground">{tool.trialDays} días</span>
            </span>
          )}
        </div>

        {tool.websiteUrl && (
          <div className="pt-1">
            <Button asChild variant="default" size="sm" className="gap-2">
              <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer">
                Visitar sitio oficial
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
