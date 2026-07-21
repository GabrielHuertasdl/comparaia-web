'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { formatScore, formatDate } from '@/lib/utils/format'
import type { ScoreResult, CriterionResult } from '@/lib/types/scoring'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ChevronDown, ChevronUp, ExternalLink, AlertTriangle, Info } from 'lucide-react'

interface ResultsExplanationProps {
  results: ScoreResult[]
  useCaseName: string
  computedAt: string
}

const CONFIDENCE_LABELS: Record<string, string> = {
  HIGH: 'Verificado',
  MEDIUM: 'Estimado',
  LOW: 'Baja confianza',
  INCOMPLETE: 'Incompleto',
}

const CONFIDENCE_VARIANTS: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  HIGH: 'default',
  MEDIUM: 'secondary',
  LOW: 'outline',
  INCOMPLETE: 'outline',
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  return (
    <Badge variant={CONFIDENCE_VARIANTS[confidence] ?? 'outline'} className="text-xs">
      {CONFIDENCE_LABELS[confidence] ?? confidence}
    </Badge>
  )
}

function BreakdownRow({ criterion }: { criterion: CriterionResult }) {
  const pct = Math.round(criterion.normalizedScore * 100)
  return (
    <div className="space-y-1.5 py-2">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium text-foreground">{criterion.criteriaName}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-mono tabular-nums text-foreground">{pct}</span>
          {criterion.isPlaceholder && (
            <span className="text-xs text-amber-600 dark:text-amber-400">(estimado)</span>
          )}
          {criterion.sourceUrl && (
            <a
              href={criterion.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Ver fuente"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
      <Progress value={pct} className="h-1.5" />
      {criterion.rawValue !== null && (
        <p className="text-xs text-muted-foreground">
          Valor raw: {criterion.rawValue}
          {criterion.sourceDate && (
            <> · Verificado: {formatDate(criterion.sourceDate.toString())}</>
          )}
        </p>
      )}
    </div>
  )
}

function ModelCard({
  result,
  rank,
}: {
  result: ScoreResult
  rank: number
}) {
  const [open, setOpen] = useState(false)
  const scorePct = Math.round(result.totalScore * 100)

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-4 p-4">
        <span
          className={cn(
            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold',
            rank === 1
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {rank}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground">{result.modelName}</span>
            <ConfidenceBadge confidence={result.confidence} />
            {result.hasPlaceholders && (
              <Badge
                variant="outline"
                className="text-xs border-amber-400 text-amber-600 dark:text-amber-400 gap-1"
              >
                <AlertTriangle className="h-3 w-3" />
                Datos incompletos
              </Badge>
            )}
            {result.isStale && (
              <Badge variant="outline" className="text-xs text-muted-foreground gap-1">
                <Info className="h-3 w-3" />
                Datos desactualizados
              </Badge>
            )}
          </div>
        </div>

        <span className="font-mono text-2xl font-bold tabular-nums text-foreground flex-shrink-0">
          {scorePct}
        </span>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          aria-label={open ? 'Ocultar desglose' : 'Ver desglose'}
        >
          {open ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Breakdown accordion */}
      {open && (
        <>
          <Separator />
          <div className="px-4 pb-4 divide-y divide-border">
            {result.breakdown.map((criterion) => (
              <BreakdownRow
                key={criterion.criteriaSlug}
                criterion={criterion}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function ResultsExplanation({
  results,
  useCaseName,
  computedAt,
}: ResultsExplanationProps) {
  const sorted = [...results].sort((a, b) => b.totalScore - a.totalScore)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Resultados — {useCaseName}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Calculado el {formatDate(computedAt)}
        </p>
      </div>

      <div className="space-y-3">
        {sorted.map((result, i) => (
          <ModelCard key={result.modelId} result={result} rank={i + 1} />
        ))}
      </div>

      <div className="rounded-lg border border-border bg-muted/40 p-4 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground text-xs">Aviso metodológico</p>
        <p>
          Resultados orientativos basados en la metodología de ComparaIA. Los
          datos tienen fecha de verificación. Ver{' '}
          <a
            href="/metodologia"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            /metodologia
          </a>{' '}
          para más información.
        </p>
      </div>
    </div>
  )
}
