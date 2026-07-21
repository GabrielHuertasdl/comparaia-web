import { NextResponse } from 'next/server'
import { z } from 'zod'
import { calculateMultipleScores } from '@/lib/scoring/engine'

const scoreSchema = z.object({
  modelIds: z.array(z.string()).min(2).max(6),
  useCaseId: z.string().min(1),
  weights: z.record(z.string(), z.number().min(0).max(1)).optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = scoreSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { modelIds, useCaseId, weights } = parsed.data

    const results = await calculateMultipleScores(modelIds, useCaseId, weights)

    return NextResponse.json(
      { data: { results, computedAt: new Date().toISOString() } },
      {
        headers: {
          'X-RateLimit-Limit': '60',
          'X-RateLimit-Remaining': '59',
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('[Comparator/score] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Scoring failed' },
      { status: 500 }
    )
  }
}
