'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'

type State = 'idle' | 'running' | 'success' | 'error'

export default function IngestButton() {
  const [state, setState] = useState<State>('idle')
  const [message, setMessage] = useState<string | null>(null)

  async function handleIngest() {
    setState('running')
    setMessage(null)
    try {
      const res = await fetch('/api/editorial/ingest', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        const queued = (data as { data?: { totalQueued?: number } }).data?.totalQueued ?? 0
        setMessage(`${queued} artículo${queued !== 1 ? 's' : ''} añadido${queued !== 1 ? 's' : ''} a la cola`)
        setState('success')
      } else {
        setMessage('Error en la ingesta. Revisa los logs.')
        setState('error')
      }
    } catch {
      setMessage('Error de red.')
      setState('error')
    }
  }

  const Icon =
    state === 'running' ? Loader2
    : state === 'success' ? CheckCircle
    : state === 'error' ? AlertTriangle
    : Play

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button
        onClick={handleIngest}
        disabled={state === 'running'}
        className="gap-2 shrink-0"
      >
        <Icon
          className={['h-4 w-4', state === 'running' ? 'animate-spin' : ''].join(' ')}
          aria-hidden="true"
        />
        {state === 'running' ? 'Ejecutando…' : 'Ejecutar ingesta'}
      </Button>
      {message && (
        <p
          className={[
            'text-xs',
            state === 'success' ? 'text-green-600 dark:text-green-400' : 'text-destructive',
          ].join(' ')}
        >
          {message}
        </p>
      )}
    </div>
  )
}
