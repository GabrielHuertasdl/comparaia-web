'use client'

import * as Icons from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { USE_CASES } from '@/lib/constants/use-cases'

interface UseCase {
  id: string
  slug: string
  name: string
  description: string
  iconName?: string | null
}

interface UseCaseSelectorProps {
  useCases: UseCase[]
  selectedId: string | null
  onSelect: (id: string) => void
}

function getIconByName(iconName: string | null | undefined) {
  if (!iconName) return null
  // Find matching slug in USE_CASES constant for canonical icon lookup
  const canonicalUseCase = USE_CASES.find((uc) => uc.iconName === iconName)
  const resolvedName = canonicalUseCase?.iconName ?? iconName
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[resolvedName]
  return IconComponent ?? null
}

export function UseCaseSelector({
  useCases,
  selectedId,
  onSelect,
}: UseCaseSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {useCases.map((useCase) => {
        const isSelected = selectedId === useCase.id
        const Icon = getIconByName(useCase.iconName)

        return (
          <button
            key={useCase.id}
            type="button"
            onClick={() => onSelect(useCase.id)}
            className={cn(
              'flex items-start gap-3 rounded-lg border p-4 text-left transition-all hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              isSelected
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card',
            )}
            aria-pressed={isSelected}
          >
            {Icon && (
              <span
                className={cn(
                  'mt-0.5 flex-shrink-0',
                  isSelected ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
            )}
            <div className="min-w-0">
              <p
                className={cn(
                  'text-sm font-medium leading-tight',
                  isSelected ? 'text-primary' : 'text-foreground',
                )}
              >
                {useCase.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {useCase.description}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
