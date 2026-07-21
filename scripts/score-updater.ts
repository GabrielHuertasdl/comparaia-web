/**
 * ComparaIA — Score Updater
 *
 * 1. Flags stale scores: ModelScores where sourceDate is older than 90 days
 *    and confidence is not PLACEHOLDER are downgraded to ESTIMATED.
 *
 * 2. Reports missing coverage: (model × useCase) combos with zero score records
 *    so admins can prioritise data collection.
 *
 * Usage:
 *   tsx scripts/score-updater.ts
 */

import { PrismaClient, ScoreConfidence } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[score-updater] Starting...');

  // ── 1. Flag stale scores ───────────────────────────────────────────────────

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const staleScores = await prisma.modelScore.findMany({
    where: {
      sourceDate: { lt: ninetyDaysAgo },
      confidence: { not: ScoreConfidence.PLACEHOLDER },
    },
    include: {
      model: { select: { name: true, slug: true } },
      useCase: { select: { name: true, slug: true } },
      criteria: { select: { name: true, slug: true } },
    },
  });

  if (staleScores.length === 0) {
    console.log('[score-updater] No stale scores found (all sourceDate within 90 days or PLACEHOLDER).');
  } else {
    console.log(`[score-updater] Found ${staleScores.length} stale score(s). Downgrading to ESTIMATED...`);

    let updatedCount = 0;

    for (const score of staleScores) {
      const wasConfidence = score.confidence;
      const staleDays = Math.floor(
        (Date.now() - (score.sourceDate?.getTime() ?? 0)) / (1000 * 60 * 60 * 24),
      );

      const staleNote = `[STALE] Confidence downgraded from ${wasConfidence} to ESTIMATED on ${new Date().toISOString().slice(0, 10)}. Source date was ${score.sourceDate?.toISOString().slice(0, 10) ?? 'unknown'} (${staleDays} days ago). Previous note: ${score.notes ?? '(none)'}`;

      await prisma.modelScore.update({
        where: { id: score.id },
        data: {
          confidence: ScoreConfidence.ESTIMATED,
          notes: staleNote,
        },
      });

      console.log(
        `  [updated] ${score.model.name} × ${score.useCase.name} / ${score.criteria.name}` +
          ` (was ${wasConfidence}, ${staleDays}d old)`,
      );

      updatedCount++;
    }

    console.log(`[score-updater] Updated ${updatedCount} record(s) to ESTIMATED.`);
  }

  // ── 2. Report missing coverage ─────────────────────────────────────────────

  console.log('[score-updater] Checking for missing (model × useCase) coverage...');

  const [allModels, allUseCases] = await Promise.all([
    prisma.aIModel.findMany({ select: { id: true, name: true, slug: true } }),
    prisma.useCase.findMany({ select: { id: true, name: true, slug: true } }),
  ]);

  // Fetch distinct (modelId, useCaseId) pairs that have at least one score
  const existingCoverage = await prisma.modelScore.findMany({
    select: { modelId: true, useCaseId: true },
    distinct: ['modelId', 'useCaseId'],
  });

  const coveredSet = new Set(
    existingCoverage.map((s) => `${s.modelId}::${s.useCaseId}`),
  );

  const missing: string[] = [];

  for (const model of allModels) {
    for (const uc of allUseCases) {
      const key = `${model.id}::${uc.id}`;
      if (!coveredSet.has(key)) {
        missing.push(`${model.name} (${model.slug}) × ${uc.name} (${uc.slug})`);
      }
    }
  }

  if (missing.length === 0) {
    console.log('[score-updater] Full coverage achieved — all models have scores for all use cases.');
  } else {
    console.log(`[score-updater] Missing coverage (${missing.length} combos):`);
    for (const entry of missing) {
      console.log(`  Missing coverage: ${entry}`);
    }
  }

  console.log('[score-updater] Done.');
}

main()
  .catch((err) => {
    console.error('[score-updater] Fatal error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
