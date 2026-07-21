import { db } from '@/lib/db'
import { SourceManager } from '@/components/admin/SourceManager'
import IngestButton from './IngestButton'

export default async function FuentesPage() {
  const sources = await db.source.findMany({
    orderBy: [{ active: 'desc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      url: true,
      type: true,
      active: true,
      lastFetchAt: true,
    },
  })

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Fuentes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configura las fuentes RSS y APIs para la ingesta automática de contenido.
          </p>
        </div>
        <IngestButton />
      </div>

      <SourceManager sources={sources} />
    </div>
  )
}
