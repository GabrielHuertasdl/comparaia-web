import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils/format'
import type { ArticleStatus } from '@prisma/client'

const STATUS_LABELS: Record<ArticleStatus, string> = {
  INGESTED: 'Ingestado',
  DRAFTING: 'Borrador',
  IN_REVIEW: 'En revisión',
  APPROVED: 'Aprobado',
  PUBLISHED: 'Publicado',
  REJECTED: 'Rechazado',
  ARCHIVED: 'Archivado',
}

const STATUS_COLORS: Record<ArticleStatus, string> = {
  INGESTED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  DRAFTING: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  IN_REVIEW: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  PUBLISHED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  ARCHIVED: 'bg-gray-50 text-gray-500 dark:bg-gray-900 dark:text-gray-500',
}

interface Props {
  searchParams: { status?: string; page?: string }
}

export default async function AdminArticulosPage({ searchParams }: Props) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const page = Number(searchParams.page ?? '1')
  const pageSize = 25
  const statusFilter = searchParams.status as ArticleStatus | undefined

  const [articles, total] = await Promise.all([
    db.article.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip: (page - 1) * pageSize,
      include: {
        source: { select: { name: true } },
        categories: { include: { category: { select: { name: true } } } },
      },
    }),
    db.article.count({
      where: statusFilter ? { status: statusFilter } : undefined,
    }),
  ])

  const hasMore = page * pageSize < total
  const statuses: ArticleStatus[] = [
    'INGESTED',
    'IN_REVIEW',
    'APPROVED',
    'PUBLISHED',
    'REJECTED',
    'ARCHIVED',
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Artículos</h1>
        <span className="text-sm text-muted-foreground">{total} artículos total</span>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        <Link
          href="/admin/articulos"
          className={`px-3 py-1 rounded-full text-sm ${!statusFilter ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
        >
          Todos
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/articulos?status=${s}`}
            className={`px-3 py-1 rounded-full text-sm ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {/* Articles table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Título</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Fuente</th>
              <th className="text-left px-4 py-3 font-medium">Estado</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Fecha</th>
              <th className="text-left px-4 py-3 font-medium">Relevancia</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-medium line-clamp-1">{article.title}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                  {article.source?.name ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[article.status]}`}
                  >
                    {STATUS_LABELS[article.status]}
                  </span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs">
                  {formatDate(article.createdAt)}
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {article.relevanceScore.toFixed(1)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/articulos/${article.id}`}
                    className="text-primary hover:underline text-xs"
                  >
                    Editar →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex gap-2 justify-end">
        {page > 1 && (
          <Link
            href={`/admin/articulos?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ''}`}
            className="px-3 py-1 border border-border rounded text-sm hover:bg-muted"
          >
            ← Anterior
          </Link>
        )}
        {hasMore && (
          <Link
            href={`/admin/articulos?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ''}`}
            className="px-3 py-1 border border-border rounded text-sm hover:bg-muted"
          >
            Siguiente →
          </Link>
        )}
      </div>
    </div>
  )
}
