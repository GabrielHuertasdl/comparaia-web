import type { ScoreConfidence } from '@prisma/client'

export interface CriterionResult {
  criteriaSlug: string
  criteriaName: string
  weight: number
  rawValue: number | null
  normalizedScore: number
  weightedContribution: number
  confidence: ScoreConfidence
  sourceUrl: string | null
  sourceDate: Date | null
  isPlaceholder: boolean
}

export type ScoreConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'INCOMPLETE'

export interface ScoreResult {
  modelId: string
  modelName: string
  totalScore: number
  breakdown: CriterionResult[]
  confidence: ScoreConfidenceLevel
  hasPlaceholders: boolean
  isStale: boolean
}

export interface ScoreInput {
  modelId: string
  useCaseId: string
  overrideWeights?: Record<string, number>
}

export interface ComparatorResult {
  results: ScoreResult[]
  useCaseName: string
  criteria: { slug: string; name: string; weight: number }[]
  computedAt: string
}
