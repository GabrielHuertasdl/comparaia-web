import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils/cn'

interface AffiliateDisclosureProps {
  compact?: boolean
}

export function AffiliateDisclosure({ compact = false }: AffiliateDisclosureProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'inline-flex items-center gap-1 cursor-default select-none text-[hsl(var(--affiliate))]',
            compact ? 'text-[10px]' : 'text-xs',
          )}
          style={{ fontVariant: 'small-caps' }}
        >
          <Info className={cn('shrink-0', compact ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
          Enlace de afiliado
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">
        ComparaIA puede recibir una comisión si contratas a través de este enlace. No afecta a
        nuestra puntuación ni editorial.
      </TooltipContent>
    </Tooltip>
  )
}
