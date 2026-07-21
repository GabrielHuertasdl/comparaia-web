'use client'

import { useState, useCallback, useMemo } from 'react'

export type Step = 'models' | 'usecase' | 'weights' | 'results'

const STEP_ORDER: Step[] = ['models', 'usecase', 'weights', 'results']

export interface ComparatorState {
  step: Step
  selectedModelIds: string[]
  selectedUseCaseId: string | null
  weights: Record<string, number>
  isLoading: boolean
  error: string | null
}

const INITIAL_STATE: ComparatorState = {
  step: 'models',
  selectedModelIds: [],
  selectedUseCaseId: null,
  weights: {},
  isLoading: false,
  error: null,
}

function canProceedFrom(step: Step, state: ComparatorState): boolean {
  switch (step) {
    case 'models':
      return state.selectedModelIds.length >= 2
    case 'usecase':
      return state.selectedUseCaseId !== null
    case 'weights':
      return true
    case 'results':
      return false
    default:
      return false
  }
}

export function useComparator(): {
  state: ComparatorState
  selectModel: (id: string) => void
  deselectModel: (id: string) => void
  setUseCase: (id: string) => void
  setWeights: (weights: Record<string, number>) => void
  goToStep: (step: Step) => void
  goNext: () => void
  goBack: () => void
  reset: () => void
  canProceed: boolean
} {
  const [state, setState] = useState<ComparatorState>(INITIAL_STATE)

  const selectModel = useCallback((id: string) => {
    setState((prev) => {
      if (prev.selectedModelIds.includes(id)) return prev
      return {
        ...prev,
        selectedModelIds: [...prev.selectedModelIds, id],
        error: null,
      }
    })
  }, [])

  const deselectModel = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      selectedModelIds: prev.selectedModelIds.filter((m) => m !== id),
      error: null,
    }))
  }, [])

  const setUseCase = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      selectedUseCaseId: id,
      error: null,
    }))
  }, [])

  const setWeights = useCallback((weights: Record<string, number>) => {
    setState((prev) => ({
      ...prev,
      weights,
      error: null,
    }))
  }, [])

  const goToStep = useCallback((step: Step) => {
    setState((prev) => {
      const targetIndex = STEP_ORDER.indexOf(step)
      const currentIndex = STEP_ORDER.indexOf(prev.step)

      // Always allow going backwards; going forward requires each prior step to be valid
      if (targetIndex > currentIndex) {
        for (let i = currentIndex; i < targetIndex; i++) {
          if (!canProceedFrom(STEP_ORDER[i], prev)) {
            return {
              ...prev,
              error: `Completa el paso "${STEP_ORDER[i]}" antes de continuar.`,
            }
          }
        }
      }

      return { ...prev, step, error: null }
    })
  }, [])

  const goNext = useCallback(() => {
    setState((prev) => {
      const currentIndex = STEP_ORDER.indexOf(prev.step)
      if (!canProceedFrom(prev.step, prev)) {
        return {
          ...prev,
          error: getValidationError(prev.step),
        }
      }
      if (currentIndex >= STEP_ORDER.length - 1) return prev
      return { ...prev, step: STEP_ORDER[currentIndex + 1], error: null }
    })
  }, [])

  const goBack = useCallback(() => {
    setState((prev) => {
      const currentIndex = STEP_ORDER.indexOf(prev.step)
      if (currentIndex <= 0) return prev
      return { ...prev, step: STEP_ORDER[currentIndex - 1], error: null }
    })
  }, [])

  const reset = useCallback(() => {
    setState(INITIAL_STATE)
  }, [])

  const canProceed = useMemo(
    () => canProceedFrom(state.step, state),
    [state],
  )

  return {
    state,
    selectModel,
    deselectModel,
    setUseCase,
    setWeights,
    goToStep,
    goNext,
    goBack,
    reset,
    canProceed,
  }
}

function getValidationError(step: Step): string {
  switch (step) {
    case 'models':
      return 'Selecciona al menos 2 modelos para continuar.'
    case 'usecase':
      return 'Selecciona un caso de uso para continuar.'
    case 'weights':
      return 'Configura los pesos antes de continuar.'
    default:
      return 'No se puede continuar.'
  }
}
