'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, ExternalLink, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils/cn'
import { formatDateRelative, formatScore } from '@/lib/utils/format'
import type { QueueItem } from '@/lib/types/editorial'

interface EditorialQueueProps {
  items: QueueItem[]
  onRefresh: () => void
}

function priorityColor(priority: number): string {
  if (priority >= 8) return 'bg-red-500 text-white'
  if (priority >= 5) return 'bg-amber-500 text-white'
  return 'bg-secondary text-secondary-foreground'
}

export function EditorialQueue({ items, onRefresh }: EditorialQueueProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [rejecting, setRejecting] = useState<Set<string>>(new Set())

  const sorted = [...items].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority
    return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
  })

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleReject(queueItemId: string, articleId: string) {
    setRejecting((prev) => new Set(prev).add(queueItemId))
    try {
      await fetch(`/api/editorial/review/${articleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'REJECTED' }),
      })
      onRefresh()
    } finally {
      setRejecting((prev) => {
        const next = new Set(prev)
        next.delete(queueItemId)
        return next
      })
    }
  }

  async function handlePriorityChange(queueItemId: string, priority: string) {
    await fetch(`/api/editorial/queue/${queueItemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: Number(priority) }),
    })
    onRefresh()
  }

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-muted-foreground">
          Cola vacía. Ejecuta la ingesta para obtener nuevos artículos.
        </p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{sorted.length} artículos en cola</p>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {sorted.map((item) => {
        const expanded = expandedIds.has(item.id)
        const isRejecting = rejecting.has(item.id)

        return (
          <Card key={item.id} className="overflow-hidden">
            <CardHeader className="pb-2 pt-4">
              <div className="flex items-start gap-3">
                <Badge
                  className={cn(
                    'shrink-0 tabular-nums',
                    priorityColor(item.priority),
                  )}
                >
                  P{item.priority}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-snug text-foreground">
                    {item.article.title}
                  </p>
                  {item.article.source && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.article.source.name}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-muted-foreground">Relevancia</p>
                  <p className="text-sm font-semibold">
                    {formatScore(item.article.relevanceScore * 10)}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pb-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.article.excerpt}
              </p>

              {item.article.keyPoints.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.id)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {expanded ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                    Puntos clave ({item.article.keyPoints.length})
                  </button>
                  {expanded && (
                    <ul className="mt-2 space-y-1 pl-3">
                      {item.article.keyPoints.map((point, i) => (
                        <li key={i} className="text-xs text-muted-foreground before:mr-1.5 before:content-['•']">
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Añadido {formatDateRelative(item.addedAt)}
                  </span>
                  {item.article.sourceUrl && (
                    <a
                      href={item.article.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Fuente
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    defaultValue={String(item.priority)}
                    onValueChange={(val) => handlePriorityChange(item.id, val)}
                  >
                    <SelectTrigger className="h-7 w-20 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((p) => (
                        <SelectItem key={p} value={String(p)}>
                          P{p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={isRejecting}
                    onClick={() => handleReject(item.id, item.article.id)}
                  >
                    Rechazar
                  </Button>

                  <Button size="sm" className="h-7 text-xs" asChild>
                    <Link href={`/admin/articulos/${item.article.id}`}>Ver y editar</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
