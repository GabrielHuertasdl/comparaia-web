'use client'

import { useState, useTransition } from 'react'
import { Mail, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'

type NewsletterSignupProps = {
  variant?: 'hero' | 'inline' | 'sidebar'
  className?: string
}

export default function NewsletterSignup({
  variant = 'inline',
  className,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Introduce un email válido.')
      return
    }

    startTransition(async () => {
      try {
        // MVP: log to API or just simulate success
        await new Promise((r) => setTimeout(r, 500))
        setSubmitted(true)
      } catch {
        setError('Ha ocurrido un error. Inténtalo de nuevo.')
      }
    })
  }

  if (submitted) {
    return (
      <div
        className={cn(
          'flex flex-col items-center gap-3 text-center',
          variant === 'hero' && 'py-4',
          className,
        )}
      >
        <CheckCircle className="h-10 w-10 text-confidence-verified" />
        <p className="font-semibold text-foreground">Suscrito correctamente</p>
        <p className="text-sm text-muted-foreground">
          Recibirás nuestro resumen semanal de IA en tu bandeja de entrada.
        </p>
      </div>
    )
  }

  const isHero = variant === 'hero'

  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        isHero && 'items-center text-center',
        className,
      )}
    >
      {isHero && (
        <>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-1">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold">
            Recibe lo mejor de la IA cada semana
          </h2>
          <p className="text-muted-foreground max-w-md">
            Resumen semanal de noticias, actualizaciones de rankings y comparativas exclusivas.
            Sin spam. Baja cuando quieras.
          </p>
        </>
      )}

      <form
        onSubmit={handleSubmit}
        className={cn(
          'flex gap-2',
          isHero ? 'flex-col sm:flex-row w-full max-w-md' : 'flex-row',
        )}
        noValidate
      >
        <label htmlFor="newsletter-email" className="sr-only">
          Tu email
        </label>
        <Input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn('flex-1', isHero && 'h-11 text-base')}
          disabled={isPending}
          required
        />
        <Button
          type="submit"
          disabled={isPending}
          className={cn(isHero && 'h-11 px-6')}
        >
          {isPending ? 'Enviando…' : 'Suscribirme'}
        </Button>
      </form>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {!isHero && (
        <p className="text-xs text-muted-foreground">
          Sin spam. Baja cuando quieras.
        </p>
      )}
    </div>
  )
}
