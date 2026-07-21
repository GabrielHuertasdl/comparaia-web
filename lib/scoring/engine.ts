import { ScoreConfidence } from '@prisma/client'
import { db } from '@/lib/db'
import type { ScoreInput, ScoreResult, CriterionResult, ScoreConfidenceLevel } from '@/lib/types/scoring'
import { computeNormalized, validateAndNormalizeWeights } from './normalizer'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STALE_DAYS = 90
const PLACEHOLDER_NEUTRAL = 5.0

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

export function isOlderThan90Days(date: Date): boolean {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - STALE_DAYS)
  return date < cutoff
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Derive an overall confidence level from the per-criterion breakdown.
 *
 * Priority (worst-case wins):
 *   PLACEHOLDER → INCOMPLETE
 *   ESTIMATED   → LOW
 *   COMMUNITY   → MEDIUM
 *   all VERIFIED → HIGH
 */
export function deriveConfidence(breakdown: CriterionResult[]): ScoreConfidenceLevel {
  if (breakdown.some((c) => c.isPlaceholder)) return 'INCOMPLETE'
  if (breakdown.some((c) => c.confidence === ScoreConfidence.ESTIMATED)) return 'LOW'
  if (breakdown.some((c) => c.confidence === ScoreConfidence.COMMUNITY)) return 'MEDIUM'
  return 'HIGH'
}

// ---------------------------------------------------------------------------
// Core engine
// ---------------------------------------------------------------------------

/**
 * Compute the aggregated score for a single model in a given use-case.
 *
 * Steps:
 * 1. Fetch all ScoringCriteria for the use-case, with the model's ModelScore
 *    for each criterion (if one exists).
 * 2. Resolve weights (override > DB default), validate they sum to 1.0.
 * 3. For each criterion, normalize the raw value to 0-10 and multiply by
 *    its weight to produce a weighted contribution.
 *    PLACEHOLDER entries use a neutral raw value of 5.0.
 * 4. totalScore = sum(weightedContribution) × 10  → 0-100 scale.
 * 5. Derive overall confidence and staleness flags.
 */
export async function calculateScore(input: ScoreInput): Promise<ScoreResult> {
  const { modelId, useCaseId, overrideWeights } = input

  // 1. Load criteria + model's scores in a single query
  const criteriaRows = await db.scoringCriteria.findMany({
    where: { useCaseId },
    include: {
      scores: {
        where: { modelId, useCaseId },
        take: 1,
      },
    },
    orderBy: { slug: 'asc' },
  })

  if (criteriaRows.length === 0) {
    throw new Error(`No scoring criteria found for useCaseId=${useCaseId}`)
  }

  // 2. Resolve weights
  const effectiveWeights = validateAndNormalizeWeights(
    overrideWeights ?? {},
    criteriaRows.map((c) => ({ slug: c.slug, weight: c.weight })),
  )

  // 3. Fetch model name
  const model = await db.aIModel.findUnique({
    where: { id: modelId },
    select: { name: true },
  })
  if (!model) {
    throw new Error(`AIModel not found: ${modelId}`)
  }

  // 4. Build breakdown
  let hasPlaceholders = false
  let isStale = false

  const breakdown: CriterionResult[] = criteriaRows.map((criterion) => {
    const score = criterion.scores[0] ?? null
    const weight = effectiveWeights[criterion.slug] ?? criterion.weight
    const isPlaceholder = !score || score.confidence === ScoreConfidence.PLACEHOLDER

    if (isPlaceholder) hasPlaceholders = true

    // Check staleness
    if (score?.sourceDate && isOlderThan90Days(score.sourceDate)) {
      isStale = true
    }

    const rawValue = isPlaceholder
      ? PLACEHOLDER_NEUTRAL
      : (score.rawValue ?? PLACEHOLDER_NEUTRAL)

    const normalizedScore =
      score?.normalizedScore != null
        ? // Trust a pre-computed normalizedScore when available
          Math.max(0, Math.min(10, score.normalizedScore))
        : computeNormalized(rawValue, {
            minValue: criterion.minValue,
            maxValue: criterion.maxValue,
            higherIsBetter: criterion.higherIsBetter,
          })

    const weightedContribution = normalizedScore * weight

    return {
      criteriaSlug: criterion.slug,
      criteriaName: criterion.name,
      weight,
      rawValue: score?.rawValue ?? null,
      normalizedScore,
      weightedContribution,
      confidence: score?.confidence ?? ScoreConfidence.PLACEHOLDER,
      sourceUrl: score?.sourceUrl ?? null,
      sourceDate: score?.sourceDate ?? null,
      isPlaceholder,
    }
  })

  // totalScore: sum of (normalizedScore × weight) is already on 0-10;
  // multiply by 10 for 0-100 scale.
  const totalScore = Math.round(
    breakdown.reduce((acc, c) => acc + c.weightedContribution, 0) * 10 * 10,
  ) / 10

  const confidence = deriveConfidence(breakdown)

  return {
    modelId,
    modelName: model.name,
    totalScore: Math.max(0, Math.min(100, totalScore)),
    breakdown,
    confidence,
    hasPlaceholders,
    isStale,
  }
}

/**
 * Compute scores for multiple models in the same use-case, in parallel.
 * Returns results sorted by totalScore descending.
 */
export async function calculateMultipleScores(
  modelIds: string[],
  useCaseId: string,
  overrideWeights?: Record<string, number>,
): Promise<ScoreResult[]> {
  const results = await Promise.all(
    modelIds.map((modelId) =>
      calculateScore({ modelId, useCaseId, overrideWeights }),
    ),
  )

  return results.sort((a, b) => b.totalScore - a.totalScore)
}
