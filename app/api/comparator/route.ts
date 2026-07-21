import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { calculateMultipleScores } from '@/lib/scoring/engine'
import type { ComparatorScoreRequest } from '@/lib/types/api'

export async function POST(req: NextRequest) {
  try {
    const body: ComparatorScoreRequest = await req.json()
    const { modelIds, useCaseId, weights } = body

    if (!Array.isArray(modelIds) || modelIds.length < 2 || !useCaseId) {
      return NextResponse.json(
        { error: 'Se requieren al menos 2 modelIds y un useCaseId.' },
        { status: 400 },
      )
    }

    const [scores, useCase, criteria] = await Promise.all([
      calculateMultipleScores(modelIds, useCaseId, weights),
      db.useCase.findUnique({
        where: { id: useCaseId },
        select: { name: true },
      }),
      db.scoringCriteria.findMany({
        where: { useCaseId },
        select: { slug: true, name: true, weight: true },
        orderBy: { slug: 'asc' },
      }),
    ])

    if (!useCase) {
      return NextResponse.json({ error: 'Caso de uso no encontrado.' }, { status: 404 })
    }

    return NextResponse.json({
      data: {
        results: scores,
        useCaseName: useCase.name,
        criteria,
        computedAt: new Date().toISOString(),
      },
    })
  } catch (err) {
    console.error('[POST /api/comparator] error:', err)
    return NextResponse.json(
      { error: 'Error al calcular puntuaciones.' },
      { status: 500 },
    )
  }
}
