'use client'

import { useState } from 'react'
import { AlertTriangle, Save, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils/cn'
import { formatDateShort } from '@/lib/utils/format'

interface Criterion {
  id: string
  name: string
  slug: string
  unit?: string | null
  confidence: string
  rawValue?: number | null
  normalizedScore?: number | null
  sourceUrl?: string | null
  sourceDate?: Date | null
}

interface UseCase {
  id: string
  name: string
  criteria: Criterion[]
}

interface ScoreEditorProps {
  modelId: string
  modelName: string
  useCases: UseCase[]
}

const CONFIDENCE_OPTIONS = ['VERIFIED', 'COMMUNITY', 'ESTIMATED', 'PLACEHOLDER'] as const
type ConfidenceOption = (typeof CONFIDENCE_OPTIONS)[number]

const CONFIDENCE_LABEL: Record<ConfidenceOption, string> = {
  VERIFIED: 'Verificado',
  COMMUNITY: 'Comunidad',
  ESTIMATED: 'Estimado',
  PLACEHOLDER: 'Marcador',
}

const CONFIDENCE_BADGE: Record<ConfidenceOption, string> = {
  VERIFIED: 'bg-[var(--confidence-verified)] text-white',
  COMMUNITY: 'bg-secondary text-secondary-foreground',
  ESTIMATED: 'bg-[var(--confidence-estimated)] text-white',
  PLACEHOLDER: 'bg-[var(--confidence-placeholder)] text-white',
}

const STALE_DAYS = 90

function isStale(date: Date | null | undefined): boolean {
  if (!date) return false
  const d = typeof date === 'string' ? new Date(date) : date
  const diffMs = Date.now() - d.getTime()
  return diffMs > STALE_DAYS * 24 * 60 * 60 * 1000
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

interface CriterionState {
  rawValue: string
  sourceUrl: string
  sourceDate: string
  confidence: ConfidenceOption
  saving: boolean
  saved: boolean
  error: string | null
}

function useCriterionState(criterion: Criterion): [CriterionState, (patch: Partial<CriterionState>) => void] {
  const [state, setState] = useState<CriterionState>({
    rawValue: criterion.rawValue != null ? String(criterion.rawValue) : '',
    sourceUrl: criterion.sourceUrl ?? '',
    sourceDate: criterion.sourceDate
      ? (typeof criterion.sourceDate === 'string'
          ? criterion.sourceDate
          : criterion.sourceDate.toISOString().split('T')[0])
      : '',
    confidence: (criterion.confidence as ConfidenceOption) ?? 'PLACEHOLDER',
    saving: false,
    saved: false,
    error: null,
  })

  function patch(update: Partial<CriterionState>) {
    setState((prev) => ({ ...prev, ...update }))
  }

  return [state, patch]
}

function CriterionRow({ criterion }: { criterion: Criterion }) {
  const [state, patch] = useCriterionState(criterion)
  const stale = isStale(criterion.sourceDate)

  async function save() {
    patch({ saving: true, saved: false, error: null })
    try {
      const res = await fetch(`/api/scores/${criterion.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawValue: state.rawValue !== '' ? Number(state.rawValue) : null,
          sourceUrl: state.sourceUrl || null,
          sourceDate: state.sourceDate || null,
          confidence: state.confidence,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      patch({ saved: true })
      setTimeout(() => patch({ saved: false }), 2000)
    } catch (err) {
      patch({ error: err instanceof Error ? err.message : 'Error al guardar' })
    } finally {
      patch({ saving: false })
    }
  }

  return (
    <div className="rounded-md border border-border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-foreground">{criterion.name}</p>
        {criterion.unit && (
          <span className="text-xs text-muted-foreground">({criterion.unit})</span>
        )}
        <Badge
          className={cn(
            'ml-auto text-xs',
            CONFIDENCE_BADGE[state.confidence as ConfidenceOption] ?? '',
          )}
        >
          {CONFIDENCE_LABEL[state.confidence as ConfidenceOption] ?? state.confidence}
        </Badge>
        {stale && (
          <span
            className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400"
            title="Datos con más de 90 días de antigüedad"
          >
            <AlertTriangle className="h-3 w-3" />
            Desactualizado
          </span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <Label htmlFor={`rv-${criterion.id}`} className="text-xs">
            Valor bruto
          </Label>
          <Input
            id={`rv-${criterion.id}`}
            type="number"
            step="any"
            value={state.rawValue}
            onChange={(e) => patch({ rawValue: e.target.value })}
            placeholder="—"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor={`conf-${criterion.id}`} className="text-xs">
            Confianza
          </Label>
          <Select
            value={state.confidence}
            onValueChange={(val) => patch({ confidence: val as ConfidenceOption })}
          >
            <SelectTrigger id={`conf-${criterion.id}`} className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONFIDENCE_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {CONFIDENCE_LABEL[opt]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor={`sd-${criterion.id}`} className="text-xs">
            Fecha fuente
          </Label>
          <Input
            id={`sd-${criterion.id}`}
            type="date"
            value={state.sourceDate}
            onChange={(e) => patch({ sourceDate: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor={`su-${criterion.id}`} className="text-xs">
            URL fuente
          </Label>
          <div className="flex gap-1">
            <Input
              id={`su-${criterion.id}`}
              type="url"
              value={state.sourceUrl}
              onChange={(e) => patch({ sourceUrl: e.target.value })}
              placeholder="https://…"
              className="min-w-0 flex-1"
            />
            {state.sourceUrl && (
              <a
                href={state.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {criterion.sourceDate && (
        <p className="text-xs text-muted-foreground">
          Última actualización: {formatDateShort(criterion.sourceDate)}
        </p>
      )}

      {state.error && <p className="text-xs text-destructive">{state.error}</p>}

      <div className="flex items-center justify-end gap-2">
        {state.saved && <span className="text-xs text-green-600">Guardado</span>}
        <Button size="sm" className="h-7 text-xs" onClick={save} disabled={state.saving}>
          <Save className="mr-1.5 h-3.5 w-3.5" />
          {state.saving ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>
    </div>
  )
}

export function ScoreEditor({ modelId: _modelId, modelName, useCases }: ScoreEditorProps) {
  if (useCases.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-12 text-center">
        <p className="text-muted-foreground">No hay casos de uso configurados para {modelName}.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">{modelName}</h2>
        <p className="text-sm text-muted-foreground">Edición de puntuaciones por caso de uso</p>
      </div>

      <Tabs defaultValue={useCases[0].id}>
        <TabsList className="flex-wrap">
          {useCases.map((uc) => (
            <TabsTrigger key={uc.id} value={uc.id}>
              {uc.name}
              <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs tabular-nums">
                {uc.criteria.length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {useCases.map((uc) => (
          <TabsContent key={uc.id} value={uc.id} className="mt-4 space-y-3">
            {uc.criteria.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Sin criterios para este caso de uso.
              </p>
            )}
            {uc.criteria.map((criterion, i) => (
              <div key={criterion.id}>
                <CriterionRow criterion={criterion} />
                {i < uc.criteria.length - 1 && <Separator className="my-1 opacity-0" />}
              </div>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
