import Image from 'next/image'
import { Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatScore } from '@/lib/utils/format'

interface ComparisonModel {
  model: {
    id: string
    name: string
    developer: string
    logoUrl?: string | null
    contextWindow?: number | null
    supportsVision: boolean
    supportsTools: boolean
    supportsCode: boolean
    scores?: {
      criteriaId: string
      criteria: { name: string; slug: string }
      normalizedScore?: number | null
    }[]
  }
}

interface ComparisonTableProps {
  models: ComparisonModel[]
}

type FeatureRow = {
  label: string
  key: keyof ComparisonModel['model']
  type: 'boolean' | 'number' | 'text'
}

const FEATURE_ROWS: FeatureRow[] = [
  { label: 'Desarrollador', key: 'developer', type: 'text' },
  { label: 'Ventana de contexto', key: 'contextWindow', type: 'number' },
  { label: 'Visión', key: 'supportsVision', type: 'boolean' },
  { label: 'Uso de herramientas', key: 'supportsTools', type: 'boolean' },
  { label: 'Generación de código', key: 'supportsCode', type: 'boolean' },
]

function FeatureValue({ value, type }: { value: unknown; type: FeatureRow['type'] }) {
  if (type === 'boolean') {
    return value ? (
      <Check className="h-4 w-4 text-green-600 mx-auto" aria-label="Sí" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground mx-auto" aria-label="No" />
    )
  }
  if (type === 'number') {
    const n = value as number | null | undefined
    return <span className="text-sm">{n != null ? n.toLocaleString('es-ES') : '—'}</span>
  }
  return <span className="text-sm">{String(value ?? '—')}</span>
}

export function ComparisonTable({ models }: ComparisonTableProps) {
  if (models.length === 0) return null

  // Gather all criteria present across models
  const criteriaMap = new Map<string, string>()
  for (const { model } of models) {
    for (const score of model.scores ?? []) {
      criteriaMap.set(score.criteriaId, score.criteria.name)
    }
  }
  const criteriaList = Array.from(criteriaMap.entries())

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="py-3 px-4 text-left font-medium text-muted-foreground w-40">
              Característica
            </th>
            {models.map(({ model }) => (
              <th key={model.id} className="py-3 px-4 text-center font-medium">
                <div className="flex flex-col items-center gap-1.5">
                  {model.logoUrl && (
                    <Image
                      src={model.logoUrl}
                      alt={model.name}
                      width={24}
                      height={24}
                      className="rounded object-contain"
                    />
                  )}
                  <span>{model.name}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FEATURE_ROWS.map((row) => (
            <tr key={row.key} className="border-b border-border last:border-0 hover:bg-muted/20">
              <td className="py-3 px-4 text-muted-foreground font-medium">{row.label}</td>
              {models.map(({ model }) => (
                <td key={model.id} className="py-3 px-4 text-center">
                  <FeatureValue value={model[row.key]} type={row.type} />
                </td>
              ))}
            </tr>
          ))}

          {criteriaList.length > 0 && (
            <tr>
              <td colSpan={models.length + 1} className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Puntuaciones
                  </span>
                  <Separator className="flex-1" />
                </div>
              </td>
            </tr>
          )}

          {criteriaList.map(([criteriaId, criteriaName]) => (
            <tr key={criteriaId} className="border-b border-border last:border-0 hover:bg-muted/20">
              <td className="py-3 px-4 text-muted-foreground font-medium">{criteriaName}</td>
              {models.map(({ model }) => {
                const score = model.scores?.find((s) => s.criteriaId === criteriaId)
                return (
                  <td key={model.id} className="py-3 px-4 text-center">
                    {score?.normalizedScore != null ? (
                      <Badge variant="secondary" className="font-mono">
                        {formatScore(score.normalizedScore)}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
