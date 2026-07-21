'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils/cn'

type Decision = 'APPROVED' | 'REJECTED' | 'REVISION_NEEDED'

interface ReviewPanelProps {
  articleId: string
  currentStatus: string
  onDecision: (decision: Decision, feedback?: string) => Promise<void>
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Borrador',
  PENDING_REVIEW: 'Pendiente de revisión',
  APPROVED: 'Aprobado',
  PUBLISHED: 'Publicado',
  REJECTED: 'Rechazado',
  REVISION_NEEDED: 'Revisión solicitada',
}

const STATUS_VARIANT: Record<string, string> = {
  DRAFT: 'secondary',
  PENDING_REVIEW: 'outline',
  APPROVED: 'default',
  PUBLISHED: 'default',
  REJECTED: 'destructive',
  REVISION_NEEDED: 'outline',
}

const DECISION_CONFIG = {
  APPROVED: {
    label: 'Aprobar',
    icon: CheckCircle,
    className: 'border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950',
    needsFeedback: false,
    dialogTitle: '¿Aprobar este artículo?',
    dialogDescription: 'El artículo quedará listo para publicar.',
  },
  REJECTED: {
    label: 'Rechazar',
    icon: XCircle,
    className: 'border-destructive text-destructive hover:bg-destructive/10',
    needsFeedback: true,
    dialogTitle: 'Rechazar artículo',
    dialogDescription: 'Indica el motivo del rechazo. El feedback es obligatorio.',
  },
  REVISION_NEEDED: {
    label: 'Solicitar revisión',
    icon: AlertTriangle,
    className: 'border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950',
    needsFeedback: true,
    dialogTitle: 'Solicitar revisión',
    dialogDescription: 'Describe los cambios necesarios. El feedback es obligatorio.',
  },
} satisfies Record<Decision, {
  label: string
  icon: React.ElementType
  className: string
  needsFeedback: boolean
  dialogTitle: string
  dialogDescription: string
}>

export function ReviewPanel({ articleId: _articleId, currentStatus, onDecision }: ReviewPanelProps) {
  const [pending, setPending] = useState<Decision | null>(null)
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openDialog(decision: Decision) {
    setFeedback('')
    setError(null)
    setPending(decision)
  }

  function closeDialog() {
    if (!submitting) setPending(null)
  }

  async function confirm() {
    if (!pending) return
    const config = DECISION_CONFIG[pending]

    if (config.needsFeedback && !feedback.trim()) {
      setError('El feedback es obligatorio para esta decisión.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await onDecision(pending, feedback.trim() || undefined)
      setPending(null)
    } catch {
      setError('Error al enviar la decisión. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const statusLabel = STATUS_LABEL[currentStatus] ?? currentStatus

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-foreground">Estado actual</p>
        <Badge
          variant={
            (STATUS_VARIANT[currentStatus] as 'default' | 'secondary' | 'outline' | 'destructive') ?? 'secondary'
          }
        >
          {statusLabel}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.entries(DECISION_CONFIG) as [Decision, typeof DECISION_CONFIG[Decision]][]).map(
          ([decision, config]) => {
            const Icon = config.icon
            return (
              <Button
                key={decision}
                variant="outline"
                size="sm"
                className={cn(config.className)}
                onClick={() => openDialog(decision)}
              >
                <Icon className="mr-1.5 h-4 w-4" />
                {config.label}
              </Button>
            )
          },
        )}
      </div>

      {pending && (
        <Dialog open onOpenChange={closeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{DECISION_CONFIG[pending].dialogTitle}</DialogTitle>
              <DialogDescription>{DECISION_CONFIG[pending].dialogDescription}</DialogDescription>
            </DialogHeader>

            {DECISION_CONFIG[pending].needsFeedback && (
              <div className="space-y-1.5">
                <Label htmlFor="rp-feedback">
                  Feedback{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <textarea
                  id="rp-feedback"
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Escribe aquí los comentarios para el autor…"
                  className="flex w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
            )}

            {!DECISION_CONFIG[pending].needsFeedback && error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={closeDialog} disabled={submitting}>
                Cancelar
              </Button>
              <Button
                onClick={confirm}
                disabled={submitting}
                className={cn(
                  pending === 'APPROVED' && 'bg-green-600 hover:bg-green-700 text-white',
                  pending === 'REJECTED' && 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
                  pending === 'REVISION_NEEDED' && 'bg-amber-500 hover:bg-amber-600 text-white',
                )}
              >
                {submitting ? 'Enviando…' : 'Confirmar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
