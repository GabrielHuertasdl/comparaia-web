'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const STORAGE_KEY = 'comparaia_affiliate_banner_dismissed'

interface AffiliateDisclosureProps {
  className?: string
}

export function AffiliateDisclosure({ className }: AffiliateDisclosureProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY)
      if (!dismissed) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    setVisible(false)
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // storage unavailable
    }
  }

  if (!visible) return null

  return (
    <div
      role="banner"
      className={cn(
        'flex items-start justify-between gap-3 bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] text-xs p-2',
        className,
      )}
    >
      <p className="leading-relaxed">
        ComparaIA utiliza enlaces de afiliado. Ganamos comisiones en compras realizadas a través de
        nuestros enlaces. Esto no influye en nuestras puntuaciones ni opiniones editoriales.{' '}
        <a href="/legal/afiliacion" className="underline hover:text-[hsl(var(--foreground))]">
          Ver política de afiliación
        </a>
        .
      </p>
      <button
        onClick={dismiss}
        aria-label="Cerrar aviso de afiliación"
        className="shrink-0 p-0.5 rounded hover:text-[hsl(var(--foreground))] transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
