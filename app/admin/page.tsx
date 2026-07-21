import { db } from '@/lib/db'
import { ArticleStatus } from '@prisma/client'
import { subDays, startOfDay } from 'date-fns'
import Link from 'next/link'
import {
  Inbox,
  FileText,
  AlertTriangle,
  WifiOff,
  ArrowRight,
} from 'lucide-react'

async function fetchStats() {
  const today = startOfDay(new Date())
  const staleThreshold = subDays(new Date(), 90)

  const [queueCount, publishedToday, staleScores, sourcesWithErrors] =
    await Promise.all([
      db.publicationQueue.count(),
      db.article.count({
        where: {
          status: ArticleStatus.PUBLISHED,
          publishedAt: { gte: today },
        },
      }),
      db.modelScore.count({
        where: {
          sourceDate: { lt: staleThreshold },
        },
      }),
      db.source.count({
        where: {
          active: true,
          lastFetchAt: { lt: subDays(new Date(), 1) },
        },
      }),
    ])

  return { queueCount, publishedToday, staleScores, sourcesWithErrors }
}

export default async function AdminDashboardPage() {
  const { queueCount, publishedToday, staleScores, sourcesWithErrors } =
    await fetchStats()

  const stats = [
    {
      label: 'Cola editorial',
      value: queueCount,
      icon: Inbox,
      href: '/admin/cola',
      urgent: queueCount > 10,
    },
    {
      label: 'Publicados hoy',
      value: publishedToday,
      icon: FileText,
      href: '/admin/articulos',
      urgent: false,
    },
    {
      label: 'Puntuaciones obsoletas',
      value: staleScores,
      icon: AlertTriangle,
      href: '/admin/puntuaciones',
      urgent: staleScores > 0,
    },
    {
      label: 'Fuentes con errores',
      value: sourcesWithErrors,
      icon: WifiOff,
      href: '/admin/fuentes',
      urgent: sourcesWithErrors > 0,
    },
  ]

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Resumen del estado del sistema.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, href, urgent }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-lg border border-border bg-card p-5 hover:border-primary/50 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div
                className={[
                  'h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0',
                  urgent
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-muted text-muted-foreground',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors mt-0.5" aria-hidden="true" />
            </div>
            <div className="mt-3">
              <p
                className={[
                  'text-3xl font-bold tabular-nums',
                  urgent ? 'text-destructive' : 'text-foreground',
                ].join(' ')}
              >
                {value}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Accesos rápidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: '/admin/cola', label: 'Revisar cola editorial' },
            { href: '/admin/articulos', label: 'Ver todos los artículos' },
            { href: '/admin/modelos', label: 'Gestionar modelos de IA' },
            { href: '/admin/puntuaciones', label: 'Actualizar puntuaciones' },
            { href: '/admin/fuentes', label: 'Gestionar fuentes' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
            >
              <ArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
