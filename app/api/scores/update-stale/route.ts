import { NextResponse } from 'next/server'
import { ScoreConfidence } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { authorizeCronOrAdmin } from '@/lib/cron'

export const dynamic = 'force-dynamic'

/** Scores whose sourceDate is older than this lose their confidence rating. */
const STALE_AFTER_DAYS = 90

const MS_PER_DAY = 1000 * 60 * 60 * 24

/**
 * Downgrades stale ModelScores to ESTIMATED and reports (model × useCase)
 * combos that have no score data at all.
 *
 * Mirrors scripts/score-updater.ts, which stays available for local runs.
 * Scheduled daily by vercel.json; also callable from the admin UI.
 */
async function updateStaleScores() {
  const cutoff = new Date(Date.now() - STALE_AFTER_DAYS * MS_PER_DAY)

  const staleScores = await db.modelScore.findMany({
    where: {
      sourceDate: { lt: cutoff },
      confidence: { not: ScoreConfidence.PLACEHOLDER },
    },
    include: {
      model: { select: { name: true, slug: true } },
      useCase: { select: { name: true, slug: true } },
      criteria: { select: { name: true, slug: true } },
    },
  })

  const downgraded: Array<{
    id: string
    model: string
    useCase: string
    criteria: string
    from: ScoreConfidence
    staleDays: number
  }> = []

  const today = new Date().toISOString().slice(0, 10)

  for (const score of staleScores) {
    const sourceDate = score.sourceDate
    const staleDays = sourceDate
      ? Math.floor((Date.now() - sourceDate.getTime()) / MS_PER_DAY)
      : 0

    const note =
      `[STALE] Confidence downgraded from ${score.confidence} to ESTIMATED on ${today}. ` +
      `Source date was ${sourceDate?.toISOString().slice(0, 10) ?? 'unknown'} (${staleDays} days ago). ` +
      `Previous note: ${score.notes ?? '(none)'}`

    await db.modelScore.update({
      where: { id: score.id },
      data: { confidence: ScoreConfidence.ESTIMATED, notes: note },
    })

    downgraded.push({
      id: score.id,
      model: score.model.name,
      useCase: score.useCase.name,
      criteria: score.criteria.name,
      from: score.confidence,
      staleDays,
    })
  }

  const [models, useCases, coverage] = await Promise.all([
    db.aIModel.findMany({ select: { id: true, name: true, slug: true } }),
    db.useCase.findMany({ select: { id: true, name: true, slug: true } }),
    db.modelScore.findMany({
      select: { modelId: true, useCaseId: true },
      distinct: ['modelId', 'useCaseId'],
    }),
  ])

  const covered = new Set(coverage.map((c) => `${c.modelId}::${c.useCaseId}`))

  const missingCoverage = models.flatMap((model) =>
    useCases
      .filter((useCase) => !covered.has(`${model.id}::${useCase.id}`))
      .map((useCase) => ({
        model: model.slug,
        useCase: useCase.slug,
        label: `${model.name} × ${useCase.name}`,
      }))
  )

  return { downgraded, missingCoverage }
}

async function handle(request: Request) {
  const caller = await authorizeCronOrAdmin(request)
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { downgraded, missingCoverage } = await updateStaleScores()

    await db.auditLog.create({
      data: {
        userId: caller.userId,
        action: 'SCORE_UPDATE',
        entityType: 'ModelScore',
        entityId: 'update-stale',
        after: {
          trigger: caller.kind,
          downgradedCount: downgraded.length,
          missingCoverageCount: missingCoverage.length,
          downgraded: downgraded.map((d) => d.id),
        },
      },
    })

    if (downgraded.length > 0) {
      revalidatePath('/rankings')
      revalidatePath('/comparativas')
    }

    return NextResponse.json({
      data: {
        staleAfterDays: STALE_AFTER_DAYS,
        downgradedCount: downgraded.length,
        downgraded,
        missingCoverageCount: missingCoverage.length,
        missingCoverage,
      },
    })
  } catch (error) {
    console.error('[scores/update-stale] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Score update failed' },
      { status: 500 }
    )
  }
}

/** Vercel cron invokes scheduled paths with GET. */
export async function GET(request: Request) {
  return handle(request)
}

/** Manual trigger from the admin UI. */
export async function POST(request: Request) {
  return handle(request)
}
