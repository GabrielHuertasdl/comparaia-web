'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCookieConsent } from '@/lib/hooks/useCookieConsent'
import { ConsentManager } from './ConsentManager'

export function CookieBanner() {
  const { showBanner, acceptAll, rejectAll } = useCookieConsent()
  const [managerOpen, setManagerOpen] = useState(false)

  if (!showBanner) return null

  return (
    <>
      <div
        role="dialog"
        aria-label="Gestión de cookies"
        className="fixed inset-x-0 bottom-0 z-50 bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] shadow-lg p-4 md:p-6"
      >
        <div className="mx-auto max-w-4xl flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed max-w-2xl">
            Usamos cookies propias y de terceros para mejorar nuestros servicios y mostrarte
            publicidad relacionada.{' '}
            <a href="/legal/cookies" className="underline hover:text-[hsl(var(--foreground))]">
              Ver Política de Cookies
            </a>
            .
          </p>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={rejectAll}>
              Rechazar todo
            </Button>
            <Button variant="outline" size="sm" onClick={() => setManagerOpen(true)}>
              Personalizar
            </Button>
            <Button size="sm" onClick={acceptAll}>
              Aceptar todo
            </Button>
          </div>
        </div>
      </div>

      <ConsentManager open={managerOpen} onOpenChange={setManagerOpen} />
    </>
  )
}
