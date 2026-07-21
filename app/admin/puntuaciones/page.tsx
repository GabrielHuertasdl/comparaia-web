import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils/format'
import { isAfter, subDays } from 'date-fns'

export default async function AdminPuntuacionesPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const models = await db.aIModel.findMany({
    where: { status: { in: ['ACTIVE', 'BETA'] } },
    orderBy: { name: 'asc' },
    include: {
      scores: {
        include: { useCase: true, criteria: true },
        orderBy: { updatedAt: 'desc' },
      },
    },
  })

  const useCases = await db.useCase.findMany({
    include: { criteria: true },
  })

  const ninetyDaysAgo = subDays(new Date(), 90)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Puntuaciones</h1>
      <p className="text-sm text-muted-foreground">
        Gestiona las puntuaciones por modelo y caso de uso. Las puntuaciones con más de 90 días se
        marcan como desactualizadas.
      </p>

      <div className="space-y-4">
        {models.map((model) => {
          const staleCount = model.scores.filter(
            (s) => s.sourceDate && isAfter(ninetyDaysAgo, s.sourceDate)
          ).length
          const placeholderCount = model.scores.filter(
            (s) => s.confidence === 'PLACEHOLDER'
          ).length
          const coverageCount = model.scores.length

          return (
            <div key={model.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-medium">
                    {model.name}{' '}
                    <span className="text-muted-foreground text-sm">({model.developer})</span>
                  </h2>
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                    <span>{coverageCount} puntuaciones</span>
                    {staleCount > 0 && (
                      <span className="text-amber-600 dark:text-amber-400">
                        ⚠ {staleCount} desactualizadas
                      </span>
                    )}
                    {placeholderCount > 0 && (
                      <span className="text-gray-500">{placeholderCount} sin datos</span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/admin/modelos/${model.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  Editar scores →
                </Link>
              </div>

              {/* Use case coverage table */}
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {useCases.map((uc) => {
                  const ucScores = model.scores.filter((s) => s.useCaseId === uc.id)
                  const isStale =
                    ucScores.length > 0 &&
                    ucScores.some((s) => s.sourceDate && isAfter(ninetyDaysAgo, s.sourceDate))
                  const hasPlaceholder = ucScores.some((s) => s.confidence === 'PLACEHOLDER')
                  const hasCoverage = ucScores.length > 0

                  return (
                    <div
                      key={uc.id}
                      className={`text-xs px-2 py-1 rounded ${
                        !hasCoverage
                          ? 'bg-muted/50 text-muted-foreground'
                          : isStale
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                            : hasPlaceholder
                              ? 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                              : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      }`}
                    >
                      {uc.name} {!hasCoverage ? '—' : isStale ? '⚠' : hasPlaceholder ? '○' : '✓'}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-xs text-muted-foreground mt-6 space-y-1">
        <p>✓ = Datos verificados y actualizados</p>
        <p>○ = Placeholder (sin datos reales)</p>
        <p>⚠ = Datos con más de 90 días de antigüedad</p>
        <p>— = Sin cobertura para este caso de uso</p>
      </div>
    </div>
  )
}
