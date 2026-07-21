import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
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

const PRICING_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  FREE: 'default',
  FREEMIUM: 'secondary',
}

interface ToolCardProps {
  tool: {
    slug: string
    name: string
    tagline: string
    logoUrl?: string | null
    pricingModel: string
    startingPrice?: number | null
    hasFreeplan: boolean
  }
  hasAffiliate?: boolean
  className?: string
}

export function ToolCard({ tool, hasAffiliate = false, className }: ToolCardProps) {
  const pricingLabel = PRICING_LABELS[tool.pricingModel] ?? tool.pricingModel
  const pricingVariant = PRICING_VARIANT[tool.pricingModel] ?? 'outline'

  return (
    <Card className={cn('h-full flex flex-col hover:shadow-md hover:border-primary/40 transition-shadow', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {tool.logoUrl ? (
            <Image
              src={tool.logoUrl}
              alt={tool.name}
              width={40}
              height={40}
              className="rounded-lg object-contain shrink-0 border border-border"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-muted shrink-0" />
          )}
          <div className="min-w-0">
            <h3 className="font-semibold leading-tight truncate">{tool.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{tool.tagline}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={pricingVariant}>{pricingLabel}</Badge>
          {tool.hasFreeplan && tool.pricingModel !== 'FREE' && (
            <Badge variant="outline" className="text-[10px]">Plan gratis</Badge>
          )}
          {tool.startingPrice != null && tool.startingPrice > 0 && (
            <span className="text-xs text-muted-foreground">
              desde {formatPrice(tool.startingPrice)}/mes
            </span>
          )}
        </div>

        {hasAffiliate && (
          <p className="mt-2 text-[10px] text-[var(--affiliate)] font-medium">
            Enlace de afiliado
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild variant="outline" size="sm" className="w-full gap-1.5">
          <Link href={`/herramientas/${tool.slug}`}>
            Ver herramienta
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
