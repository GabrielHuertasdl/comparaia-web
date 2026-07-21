'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils/cn'

type Variant = 'hero' | 'inline' | 'footer'

interface NewsletterSignupProps {
  variant?: Variant
  segment?: string
}

export function NewsletterSignup({ variant = 'inline', segment }: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!consent) return

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, segment, consent }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string }
        throw new Error(data.message ?? 'Error al suscribirse')
      }

      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Error al suscribirse. Inténtalo de nuevo.')
    }
  }

  if (status === 'success') {
    return (
      <div
        className={cn(
          'rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] text-sm p-4',
          variant === 'hero' && 'text-center text-base p-6',
        )}
      >
        Suscripción confirmada. Gracias por unirte a ComparaIA.
      </div>
    )
  }

  if (variant === 'hero') {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-[hsl(var(--card-foreground))] mb-2">
          Mantente al día con la IA
        </h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
          Análisis, comparativas y novedades de inteligencia artificial, directo a tu bandeja de
          entrada.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === 'loading'}
            className="text-center"
          />
          <ConsentRow consent={consent} onChangeConsent={setConsent} />
          {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
          <Button type="submit" disabled={!consent || status === 'loading'} className="w-full">
            {status === 'loading' ? 'Enviando…' : 'Suscribirme'}
          </Button>
        </form>
      </div>
    )
  }

  if (variant === 'footer') {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === 'loading'}
            className="text-xs h-8"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!consent || status === 'loading'}
            className="shrink-0 h-8"
          >
            {status === 'loading' ? '…' : 'Suscribir'}
          </Button>
        </div>
        <ConsentRow consent={consent} onChangeConsent={setConsent} minimal />
        {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
      </form>
    )
  }

  // inline (default)
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"
    >
      <div className="flex flex-wrap gap-2">
        <Input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === 'loading'}
          className="flex-1 min-w-40 text-sm"
        />
        <Button type="submit" disabled={!consent || status === 'loading'} className="shrink-0">
          {status === 'loading' ? 'Enviando…' : 'Suscribirme'}
        </Button>
      </div>
      <ConsentRow consent={consent} onChangeConsent={setConsent} />
      {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
    </form>
  )
}

function ConsentRow({
  consent,
  onChangeConsent,
  minimal = false,
}: {
  consent: boolean
  onChangeConsent: (v: boolean) => void
  minimal?: boolean
}) {
  return (
    <div className="flex items-start gap-2">
      <Checkbox
        id="newsletter-consent"
        checked={consent}
        onCheckedChange={(checked) => onChangeConsent(checked === true)}
        className="mt-0.5 shrink-0"
      />
      <Label
        htmlFor="newsletter-consent"
        className={cn(
          'text-[hsl(var(--muted-foreground))] cursor-pointer leading-snug',
          minimal ? 'text-[10px]' : 'text-xs',
        )}
      >
        Acepto recibir la newsletter de ComparaIA.{' '}
        <a href="/legal/privacidad" className="underline hover:text-[hsl(var(--foreground))]">
          Ver Política de Privacidad
        </a>
        .
      </Label>
    </div>
  )
}
