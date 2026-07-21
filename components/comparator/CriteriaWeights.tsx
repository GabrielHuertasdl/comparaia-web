'use client'

import { cn } from '@/lib/utils/cn'
import { Slider } from '@/components/ui/slider'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Info, RotateCcw } from 'lucide-react'

interface Criterion {
  slug: string
  name: string
  weight: number
  description: string
}

interface CriteriaWeightsProps {
  criteria: Criterion[]
  weights: Record<string, number>
  onChange: (weights: Record<string, number>) => void
}

function normalize(raw: Record<string, number>): Record<string, number> {
  const total = Object.values(raw).reduce((sum, v) => sum + v, 0)
  if (total === 0) return raw
  return Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, v / total]),
  )
}

function toPercent(weights: Record<string, number>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [k, Math.round(v * 100)]),
  )
}

export function CriteriaWeights({
  criteria,
  weights,
  onChange,
}: CriteriaWeightsProps) {
  // Displayed as 0-100 integers; stored as 0-1 fractions
  const percentWeights = toPercent(weights)

  const handleSliderChange = (slug: string, value: number[]) => {
    const newVal = value[0]
    const updatedRaw = {
      ...Object.fromEntries(criteria.map((c) => [c.slug, (weights[c.slug] ?? c.weight) * 100])),
      [slug]: newVal,
    }
    const normalized = normalize(updatedRaw)
    onChange(normalized)
  }

  const handleReset = () => {
    const defaults = Object.fromEntries(criteria.map((c) => [c.slug, c.weight]))
    // Normalize defaults in case they don't sum to 1
    onChange(normalize(defaults))
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="space-y-4">
          {criteria.map((criterion) => {
            const pct = percentWeights[criterion.slug] ?? 0
            return (
              <div key={criterion.slug} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">
                      {criterion.name}
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="flex-shrink-0 text-muted-foreground hover:text-foreground focus-visible:outline-none"
                          aria-label={`Info sobre ${criterion.name}`}
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="text-xs">{criterion.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span
                    className={cn(
                      'flex-shrink-0 font-mono text-sm tabular-nums',
                      pct === 0 ? 'text-muted-foreground' : 'text-foreground',
                    )}
                  >
                    {pct}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[pct]}
                  onValueChange={(val) => handleSliderChange(criterion.slug, val)}
                  aria-label={criterion.name}
                />
              </div>
            )
          })}
        </div>

        <p className="text-xs text-muted-foreground">
          Los pesos se normalizan automáticamente para sumar 100%.
        </p>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restablecer valores por defecto
        </Button>
      </div>
    </TooltipProvider>
  )
}
