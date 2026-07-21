'use client'

import { cn } from '@/lib/utils/cn'
import { Check } from 'lucide-react'

interface Model {
  id: string
  name: string
  developer: string
  logoUrl?: string | null
  status: string
}

interface ModelSelectorProps {
  models: Model[]
  selectedIds: string[]
  onSelect: (id: string) => void
  onDeselect: (id: string) => void
}

export function ModelSelector({
  models,
  selectedIds,
  onSelect,
  onDeselect,
}: ModelSelectorProps) {
  const isSelected = (id: string) => selectedIds.includes(id)

  const handleToggle = (id: string) => {
    if (isSelected(id)) {
      onDeselect(id)
    } else {
      onSelect(id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {models.map((model) => {
          const selected = isSelected(model.id)
          return (
            <button
              key={model.id}
              type="button"
              onClick={() => handleToggle(model.id)}
              className={cn(
                'relative flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                selected
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border bg-card',
              )}
              aria-pressed={selected}
            >
              {selected && (
                <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3" />
                </span>
              )}

              {model.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={model.logoUrl}
                  alt={`${model.name} logo`}
                  className="h-10 w-10 rounded object-contain"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded bg-muted text-muted-foreground text-xs font-bold">
                  {model.name.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div className="min-w-0 w-full">
                <p className="truncate text-sm font-medium text-foreground leading-tight">
                  {model.name}
                </p>
                <p className="truncate text-xs text-muted-foreground mt-0.5">
                  {model.developer}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {selectedIds.length > 0 && selectedIds.length < 2 && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Selecciona al menos 2 modelos para continuar.
        </p>
      )}

      {selectedIds.length >= 2 && (
        <p className="text-sm text-muted-foreground">
          {selectedIds.length} modelos seleccionados.
        </p>
      )}
    </div>
  )
}
