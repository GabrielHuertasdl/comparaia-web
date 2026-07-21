'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-2xl font-heading font-semibold">Algo ha salido mal</h1>
      <p className="text-muted-foreground max-w-sm">
        Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
