'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils/cn'
import { useComparator } from '@/lib/hooks/useComparator'
import { ModelSelector } from './ModelSelector'
import { UseCaseSelector } from './UseCaseSelector'
import { CriteriaWeights } from './CriteriaWeights'
import { ResultsExplanation } from './ResultsExplanation'
import { Button } from '@/components/ui/button'
import type { ComparatorResult } from '@/lib/types/scoring'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

const ResultsChart = dynamic(() => import('./ResultsChart').then((m) => ({ default: m.ResultsChart })), {
  ssr: false,
})

// ---- Data shapes passed from the server page ----

interface ModelOption {
  id: string
  name: string
  developer: string
  logoUrl?: string | null
  status: string
}

interface UseCaseOption {
  id: string
  slug: string
  name: string
  description: string
  iconName?: string | null
}

interface CriterionOption {
  slug: string
  name: string
  weight: number
  description: string
  useCaseId?: string
}

interface ComparatorWizardProps {
  models: ModelOption[]
  useCases: UseCaseOption[]
  criteria: CriterionOption[]
}

// ---- Step metadata ----

const STEPS = [
  { key: 'models', label: 'Modelos' },
  { key: 'usecase', label: 'Caso de uso' },
  { key: 'weights', label: 'Criterios' },
  { key: 'results', label: 'Resultados' },
] as const

type StepKey = (typeof STEPS)[number]['key']

// ---- Step indicator ----

function StepIndicator({
  currentStep,
  onGoTo,
}: {
  currentStep: StepKey
  onGoTo: (step: StepKey) => void
}) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep)

  return (
    <nav aria-label="Pasos del comparador" className="mb-8">
      <ol className="flex items-center gap-0">
        {STEPS.map((step, i) => {
          const isDone = i < currentIndex
          const isActive = step.key === currentStep
          const isClickable = i <= currentIndex

          return (
            <li key={step.key} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => isClickable && onGoTo(step.key as StepKey)}
                disabled={!isClickable}
                className={cn(
                  'flex flex-col items-center gap-1.5 group focus-visible:outline-none',
                  isClickable ? 'cursor-pointer' : 'cursor-default',
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all',
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : isDone
                        ? 'border-primary bg-primary/15 text-primary'
                        : 'border-border bg-muted text-muted-foreground',
                  )}
                >
                  {i + 1}
                </span>
                <span
                  className={cn(
                    'hidden sm:block text-xs font-medium transition-colors',
                    isActive
                      ? 'text-primary'
                      : isDone
                        ? 'text-primary/80'
                        : 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>
              </button>

              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 transition-colors',
                    i < currentIndex ? 'bg-primary/50' : 'bg-border',
                  )}
                  aria-hidden
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// ---- Wizard ----

export function ComparatorWizard({
  models,
  useCases,
  criteria,
}: ComparatorWizardProps) {
  const {
    state,
    selectModel,
    deselectModel,
    setUseCase,
    setWeights,
    goToStep,
    goNext,
    goBack,
    canProceed,
  } = useComparator()

  const [apiResult, setApiResult] = useState<ComparatorResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const currentIndex = STEPS.findIndex((s) => s.key === state.step)
  const isFirstStep = currentIndex === 0
  const isWeightsStep = state.step === 'weights'
  const isResultsStep = state.step === 'results'

  // Initialise weights from criteria defaults if empty
  const effectiveWeights =
    Object.keys(state.weights).length > 0
      ? state.weights
      : Object.fromEntries(criteria.map((c) => [c.slug, c.weight]))

  const selectedUseCase = useCases.find((u) => u.id === state.selectedUseCaseId)

  async function handleNext() {
    if (isWeightsStep) {
      // Trigger scoring before moving to results
      setIsLoading(true)
      setApiError(null)
      try {
        const res = await fetch('/api/comparator/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modelIds: state.selectedModelIds,
            useCaseId: state.selectedUseCaseId,
            weights: effectiveWeights,
          }),
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.error ?? `Error ${res.status}`)
        }
        const data: ComparatorResult = await res.json()
        setApiResult(data)
        goNext()
      } catch (err) {
        setApiError(
          err instanceof Error
            ? err.message
            : 'Error al calcular la comparación.',
        )
      } finally {
        setIsLoading(false)
      }
    } else {
      goNext()
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <StepIndicator
        currentStep={state.step as StepKey}
        onGoTo={(step) => goToStep(step)}
      />

      {/* Step content */}
      <div className="min-h-[320px]">
        {state.step === 'models' && (
          <ModelSelector
            models={models}
            selectedIds={state.selectedModelIds}
            onSelect={selectModel}
            onDeselect={deselectModel}
          />
        )}

        {state.step === 'usecase' && (
          <UseCaseSelector
            useCases={useCases}
            selectedId={state.selectedUseCaseId}
            onSelect={setUseCase}
          />
        )}

        {state.step === 'weights' && (
          <CriteriaWeights
            criteria={criteria}
            weights={effectiveWeights}
            onChange={setWeights}
          />
        )}

        {state.step === 'results' && apiResult && (
          <div className="space-y-8">
            <ResultsChart
              results={apiResult.results.map((r) => ({
                model: { name: r.modelName },
                totalScore: r.totalScore,
                breakdown: r.breakdown.map((b) => ({
                  criteriaName: b.criteriaName,
                  normalizedScore: b.normalizedScore,
                })),
              }))}
              criteria={apiResult.criteria}
            />
            <ResultsExplanation
              results={apiResult.results}
              useCaseName={apiResult.useCaseName}
              computedAt={apiResult.computedAt}
            />
          </div>
        )}
      </div>

      {/* Error messages */}
      {(state.error || apiError) && (
        <p className="text-sm text-destructive" role="alert">
          {state.error ?? apiError}
        </p>
      )}

      {/* Navigation */}
      {!isResultsStep && (
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            disabled={isFirstStep}
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            Atrás
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            disabled={!canProceed || isLoading}
            className="gap-1.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Calculando…
              </>
            ) : isWeightsStep ? (
              <>
                Ver resultados
                <ChevronRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}

      {isResultsStep && (
        <div className="pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver a criterios
          </Button>
        </div>
      )}
    </div>
  )
}
