import { Info } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils/format'

const PRICING_LABELS: Record<string, string> = {
  FREE: 'Gratis',
  FREEMIUM: 'Freemium',
  SUBSCRIPTION: 'Suscripción',
  USAGE_BASED: 'Pago por uso',
  ONE_TIME: 'Pago único',
  ENTERPRISE: 'Empresa',
}

const PRICING_DESCRIPTIONS: Record<string, string> = {
  FREE: 'Acceso completo sin coste.',
  FREEMIUM: 'Plan básico gratuito con funciones premium de pago.',
  SUBSCRIPTION: 'Pago periódico por acceso a la herramienta.',
  USAGE_BASED: 'Pagas según el uso que hagas de la herramienta.',
  ONE_TIME: 'Un solo pago para acceso permanente.',
  ENTERPRISE: 'Precios personalizados para empresas. Contacta con el proveedor.',
}

interface ToolPricingTableProps {
  pricingModel: string
  startingPrice?: number | null
  hasFreeplan: boolean
  trialDays?: number | null
}

export function ToolPricingTable({
  pricingModel,
  startingPrice,
  hasFreeplan,
  trialDays,
}: ToolPricingTableProps) {
  const label = PRICING_LABELS[pricingModel] ?? pricingModel
  const description = PRICING_DESCRIPTIONS[pricingModel] ?? ''

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Precios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {label}
          </Badge>
          {startingPrice != null && startingPrice > 0 ? (
            <div className="text-right">
              <p className="text-2xl font-mono font-bold tabular-nums">
                {formatPrice(startingPrice)}
              </p>
              <p className="text-xs text-muted-foreground">por mes</p>
            </div>
          ) : pricingModel === 'FREE' ? (
            <p className="text-2xl font-mono font-bold text-[var(--confidence-verified)]">
              Gratis
            </p>
          ) : null}
        </div>

        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        {(hasFreeplan || (trialDays != null && trialDays > 0)) && (
          <div className="space-y-1.5">
            <Separator />
            <div className="pt-1 space-y-1">
              {hasFreeplan && pricingModel !== 'FREE' && (
                <p className="text-sm flex items-center gap-1.5">
                  <span className="text-[var(--confidence-verified)] font-semibold">✓</span>
                  Plan gratuito disponible
                </p>
              )}
              {trialDays != null && trialDays > 0 && (
                <p className="text-sm flex items-center gap-1.5">
                  <span className="text-[var(--confidence-verified)] font-semibold">✓</span>
                  Prueba gratuita de {trialDays} días
                </p>
              )}
            </div>
          </div>
        )}

        <Separator />
        <div className="flex gap-1.5 text-xs text-muted-foreground">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p>Precio puede variar. Ver web oficial para detalle actual.</p>
        </div>
      </CardContent>
    </Card>
  )
}
