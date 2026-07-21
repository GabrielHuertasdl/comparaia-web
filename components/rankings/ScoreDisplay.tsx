'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/badge'
import { formatScore } from '@/lib/utils/format'

const CONFIDENCE_LABELS: Record<string, string> = {
  VERIFIED: 'Verificado',
  COMMUNITY: 'Comunidad',
  ESTIMATED: 'Estimado',
  PLACEHOLDER: 'Sin datos',
}

const CONFIDENCE_CLASSES: Record<string, string> = {
  VERIFIED: 'bg-[var(--confidence-verified)]/15 text-[var(--confidence-verified)] border-[var(--confidence-verified)]/30',
  COMMUNITY: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  ESTIMATED: 'bg-[var(--confidence-estimated)]/15 text-[var(--confidence-estimated)] border-[var(--confidence-estimated)]/30',
  PLACEHOLDER: 'bg-muted text-muted-foreground border-border',
}

function scoreColorClass(score: number): string {
  if (score >= 70) return 'text-[var(--confidence-verified)]'
  if (score >= 40) return 'text-[var(--confidence-estimated)]'
  return 'text-destructive'
}

interface ScoreDisplayProps {
  score: number
  confidence: string
  showBreakdown?: boolean
  breakdown?: {
    criteriaName: string
    weight: number
    normalizedScore: number
    confidence: string
  }[]
  className?: string
}

export function ScoreDisplay({
  score,
  confidence,
  showBreakdown = false,
  breakdown,
  className,
}: ScoreDisplayProps) {
  const [expanded, setExpanded] = useState(false)
  const hasBreakdown = showBreakdown && breakdown && breakdown.length > 0
  const confidenceKey = confidence.toUpperCase()

  return (
    <div className={cn('inline-flex flex-col items-center gap-1.5', className)}>
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            'font-mono text-2xl font-bold tabular-nums leading-none',
            scoreColorClass(score),
          )}
        >
          {formatScore(score)}
        </span>
        <Badge
          variant="outline"
          className={cn('text-[10px] px-1.5 py-0', CONFIDENCE_CLASSES[confidenceKey] ?? CONFIDENCE_CLASSES.PLACEHOLDER)}
        >
          {CONFIDENCE_LABELS[confidenceKey] ?? confidenceKey}
        </Badge>
      </div>

      {hasBreakdown && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              Ocultar desglose <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              Ver desglose <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>
      )}

      {expanded && hasBreakdown && (
        <div className="w-full mt-1 space-y-2 min-w-[200px]">
          {breakdown!.map((criterion) => (
            <div key={criterion.criteriaName} className="space-y-0.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground truncate">{criterion.criteriaName}</span>
                <span
                  className={cn('font-mono font-semibold ml-2 shrink-0', scoreColorClass(criterion.normalizedScore))}
                >
                  {formatScore(criterion.normalizedScore)}
                </span>
              </div>
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
                <div
                  className="h-full rounded-full bg-primary/60 transition-all"
                  style={{ width: `${Math.min(criterion.normalizedScore, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Peso: {Math.round(criterion.weight * 100)}%</span>
                <span
                  className={cn(
                    'px-1 rounded',
                    CONFIDENCE_CLASSES[criterion.confidence.toUpperCase()] ?? CONFIDENCE_CLASSES.PLACEHOLDER,
                  )}
                >
                  {CONFIDENCE_LABELS[criterion.confidence.toUpperCase()] ?? criterion.confidence}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
