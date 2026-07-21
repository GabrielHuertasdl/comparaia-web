import PageHeader from '@/components/layout/PageHeader'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { formatDate } from '@/lib/utils/format'
import { AlertTriangle } from 'lucide-react'

interface LegalPageLayoutProps {
  title: string
  content: string
  effectiveAt?: Date
  isDraft?: boolean
  children?: React.ReactNode
}

export default function LegalPageLayout({
  title,
  content,
  effectiveAt,
  isDraft,
  children,
}: LegalPageLayoutProps) {
  return (
    <>
      <PageHeader title={title} />
      <div className="container-editorial mx-auto px-4 py-8">
        <Breadcrumb />

        <div className="mt-6 space-y-6">
          {effectiveAt && (
            <p className="text-sm text-muted-foreground">
              Última actualización:{' '}
              <time dateTime={effectiveAt.toISOString()}>
                {formatDate(effectiveAt)}
              </time>
            </p>
          )}

          {isDraft && (
            <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <p>
                <strong>NOTA:</strong> Este documento es una base inicial.
                Revisar con asesor jurídico antes de publicar en producción.
              </p>
            </div>
          )}

          {content ? (
            <div
              className="prose prose-neutral dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground italic">
                Contenido no disponible. Este documento está pendiente de redacción.
              </p>
            </div>
          )}

          {children}
        </div>
      </div>
    </>
  )
}
