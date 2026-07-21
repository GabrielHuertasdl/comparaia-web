'use client'

import { useEffect, useState, useCallback } from 'react'
import { EditorialQueue } from '@/components/admin/EditorialQueue'
import type { QueueItem } from '@/lib/types/editorial'

export default function ColaPage() {
  const [items, setItems] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/editorial/queue')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: QueueItem[] = await res.json()
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la cola.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Cola editorial</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Artículos pendientes de revisión y publicación.
        </p>
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-lg border border-border bg-card animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && (
        <EditorialQueue items={items} onRefresh={load} />
      )}
    </div>
  )
}
