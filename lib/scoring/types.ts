// Re-export all scoring types from the shared types module
export type {
  CriterionResult,
  ScoreConfidenceLevel,
  ScoreResult,
  ScoreInput,
  ComparatorResult,
} from '@/lib/types/scoring'

import type { ScoringCriteria, ModelScore } from '@prisma/client'

/**
 * A ScoringCriteria row with its optional ModelScore for a specific model/use-case pair.
 */
export interface CriteriaWithScore extends ScoringCriteria {
  score?: ModelScore | null
}

/**
 * Input required to compute a normalized 0-10 value from a raw measurement.
 */
export interface NormalizationInput {
  rawValue: number
  minValue: number | null
  maxValue: number | null
  higherIsBetter: boolean
}

/**
 * Result of validating and normalising a weight map against a set of criteria.
 */
export interface WeightValidationResult {
  /** Normalised weights keyed by criteria slug. */
  weights: Record<string, number>
  /** Original sum before normalisation. */
  originalSum: number
  /** Whether the original weights were already valid (sum ≈ 1.0 ± 0.01). */
  wasValid: boolean
}
