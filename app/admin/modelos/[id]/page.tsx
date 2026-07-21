import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { ScoreEditor } from '@/components/admin/ScoreEditor'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ModeloScoresPage({ params }: PageProps) {
  const { id } = await params

  const model = await db.aIModel.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      developer: true,
      version: true,
      status: true,
    },
  })

  if (!model) notFound()

  // Fetch all use cases with their criteria, joined with the model's existing scores
  const useCases = await db.useCase.findMany({
    include: {
      criteria: {
        include: {
          scores: {
            where: { modelId: id },
            select: {
              id: true,
              rawValue: true,
              normalizedScore: true,
              confidence: true,
              sourceUrl: true,
              sourceDate: true,
            },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  // Map to ScoreEditor shape
  const useCasesForEditor = useCases.map((uc) => ({
    id: uc.id,
    name: uc.name,
    criteria: uc.criteria.map((criterion) => {
      const score = criterion.scores[0] ?? null
      return {
        id: score?.id ?? `${id}:${criterion.id}`,
        name: criterion.name,
        slug: criterion.slug,
        unit: criterion.unit,
        confidence: score?.confidence ?? 'PLACEHOLDER',
        rawValue: score?.rawValue ?? null,
        normalizedScore: score?.normalizedScore ?? null,
        sourceUrl: score?.sourceUrl ?? null,
        sourceDate: score?.sourceDate ?? null,
      }
    }),
  }))

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          {model.developer}
        </p>
        <h1 className="text-2xl font-heading font-bold text-foreground">
          {model.name}
          {model.version && (
            <span className="ml-2 text-base font-normal text-muted-foreground">
              v{model.version}
            </span>
          )}
        </h1>
      </div>

      <ScoreEditor
        modelId={model.id}
        modelName={model.name}
        useCases={useCasesForEditor}
      />
    </div>
  )
}
