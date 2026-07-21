/**
 * Scoring normalizer utilities.
 *
 * All public functions are pure (no I/O) so they can be tested in isolation.
 */

/**
 * Map a raw measurement onto a 0-10 scale using the criterion's configured
 * min/max range, then optionally invert the result for "lower is better" metrics.
 *
 * Rules:
 * - When minValue and maxValue are both provided: linear interpolation.
 * - When either bound is missing: treat rawValue as already on a 0-10 scale
 *   and clamp it to [0, 10].
 * - When higherIsBetter is false: invert the result so that a lower raw value
 *   yields a higher normalized score.
 */
export function computeNormalized(
  rawValue: number,
  criterion: {
    minValue: number | null
    maxValue: number | null
    higherIsBetter: boolean
  },
): number {
  const { minValue, maxValue, higherIsBetter } = criterion

  let normalized: number

  if (minValue !== null && maxValue !== null && maxValue !== minValue) {
    // Linear interpolation: (raw - min) / (max - min) × 10
    normalized = ((rawValue - minValue) / (maxValue - minValue)) * 10
  } else {
    // No valid range configured — assume rawValue is already 0-10
    normalized = rawValue
  }

  // Clamp to [0, 10]
  normalized = Math.max(0, Math.min(10, normalized))

  // Invert for "lower is better" criteria
  if (!higherIsBetter) {
    normalized = 10 - normalized
  }

  return normalized
}

/**
 * Validate that the provided weights (keyed by criteria slug) sum to
 * approximately 1.0 (±0.01).  Throws if the sum is outside that tolerance.
 *
 * When overrideWeights does not contain a key present in criteria, the
 * criterion's DB-configured weight is used as fallback before validation.
 *
 * Returns the final weight map (may be identical to the input).
 */
export function validateAndNormalizeWeights(
  weights: Record<string, number>,
  criteria: { slug: string; weight: number }[],
): Record<string, number> {
  // Build the effective weight map: provided overrides win, DB weight as fallback
  const effective: Record<string, number> = {}
  for (const c of criteria) {
    effective[c.slug] = weights[c.slug] ?? c.weight
  }

  const sum = Object.values(effective).reduce((acc, w) => acc + w, 0)

  const TOLERANCE = 0.01
  if (Math.abs(sum - 1.0) > TOLERANCE) {
    throw new Error('Los pesos deben sumar 1.0')
  }

  return effective
}
