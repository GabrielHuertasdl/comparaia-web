import Link from 'next/link'
import { db } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils/format'
import { ChevronRight } from 'lucide-react'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  ACTIVE: 'default',
  BETA: 'secondary',
  DEPRECATED: 'outline',
  DISCONTINUED: 'destructive',
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Activo',
  BETA: 'Beta',
  DEPRECATED: 'Obsoleto',
  DISCONTINUED: 'Descontinuado',
}

export default async function ModelosPage() {
  const models = await db.aIModel.findMany({
    orderBy: [{ developer: 'asc' }, { name: 'asc' }],
    include: {
      _count: { select: { scores: true } },
      scores: {
        orderBy: { updatedAt: 'desc' },
        take: 1,
        select: { updatedAt: true },
      },
    },
  })

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Modelos de IA</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {models.length} modelos registrados
        </p>
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Desarrollador</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Puntuaciones</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Última actualización</th>
              <th className="w-8 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {models.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-foreground">
                  No hay modelos registrados.
                </td>
              </tr>
            )}
            {models.map((model) => {
              const lastUpdate = model.scores[0]?.updatedAt
              return (
                <tr
                  key={model.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/modelos/${model.id}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {model.name}
                      {model.version && (
                        <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                          v{model.version}
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{model.developer}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[model.status] ?? 'secondary'}>
                      {STATUS_LABEL[model.status] ?? model.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {model._count.scores}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {lastUpdate ? formatDate(lastUpdate) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/modelos/${model.id}`}>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
