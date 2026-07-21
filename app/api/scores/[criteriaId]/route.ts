import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { computeNormalized } from '@/lib/scoring/normalizer'
import { revalidatePath } from 'next/cache'

const updateSchema = z.object({
  modelId: z.string(),
  useCaseId: z.string(),
  rawValue: z.number().nullable().optional(),
  confidence: z.enum(['VERIFIED', 'COMMUNITY', 'ESTIMATED', 'PLACEHOLDER']),
  sourceUrl: z.string().url().nullable().optional(),
  sourceDate: z.string().datetime().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export async function PATCH(request: Request, { params }: { params: { criteriaId: string } }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { modelId, useCaseId, rawValue, confidence, sourceUrl, sourceDate, notes } = parsed.data

  const criteria = await db.scoringCriteria.findUnique({ where: { id: params.criteriaId } })
  if (!criteria) return NextResponse.json({ error: 'Criteria not found' }, { status: 404 })

  const normalizedScore =
    rawValue !== null && rawValue !== undefined
      ? computeNormalized(rawValue, criteria)
      : null

  const existing = await db.modelScore.findUnique({
    where: { modelId_useCaseId_criteriaId: { modelId, useCaseId, criteriaId: params.criteriaId } },
  })

  const score = await db.modelScore.upsert({
    where: {
      modelId_useCaseId_criteriaId: { modelId, useCaseId, criteriaId: params.criteriaId },
    },
    create: {
      modelId,
      useCaseId,
      criteriaId: params.criteriaId,
      rawValue,
      normalizedScore,
      confidence,
      sourceUrl,
      sourceDate: sourceDate ? new Date(sourceDate) : null,
      notes,
    },
    update: {
      rawValue,
      normalizedScore,
      confidence,
      sourceUrl,
      sourceDate: sourceDate ? new Date(sourceDate) : null,
      notes,
    },
  })

  await db.auditLog.create({
    data: {
      userId: session.userId,
      action: 'SCORE_UPDATE',
      entityType: 'ModelScore',
      entityId: score.id,
      before: existing ? { rawValue: existing.rawValue, confidence: existing.confidence } : undefined,
      after: { rawValue, normalizedScore, confidence },
    },
  })

  revalidatePath('/rankings')
  revalidatePath('/comparativas')

  return NextResponse.json({ data: score })
}
