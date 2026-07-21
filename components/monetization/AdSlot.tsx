'use client'

import { cn } from '@/lib/utils/cn'
import { useCookieConsent } from '@/lib/hooks/useCookieConsent'

type SlotPosition = 'leaderboard' | 'sidebar-sticky' | 'mid-content' | 'interranking'

interface AdSlotProps {
  position: SlotPosition
  className?: string
}

const SLOT_DIMENSIONS: Record<SlotPosition, { width: number; height: number; adSlot: string }> = {
  leaderboard: { width: 970, height: 90, adSlot: 'leaderboard' },
  'sidebar-sticky': { width: 300, height: 600, adSlot: 'sidebar-sticky' },
  'mid-content': { width: 300, height: 250, adSlot: 'mid-content' },
  interranking: { width: 728, height: 90, adSlot: 'interranking' },
}

export function AdSlot({ position, className }: AdSlotProps) {
  const { consent } = useCookieConsent()
  const { width, height, adSlot } = SLOT_DIMENSIONS[position]

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <span className="text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))] self-start">
        Publicidad
      </span>

      {consent.advertising ? (
        <div
          data-ad-slot={adSlot}
          data-ad-client="ca-pub-comparaia"
          data-ad-format="fixed"
          style={{ width, height, minWidth: width, minHeight: height }}
          className="overflow-hidden"
        />
      ) : (
        /* Placeholder preserves layout — no ad loaded */
        <div style={{ width, height, minWidth: width, minHeight: height }} aria-hidden="true" />
      )}
    </div>
  )
}
