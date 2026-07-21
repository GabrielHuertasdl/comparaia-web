'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCookieConsent } from '@/lib/hooks/useCookieConsent'

interface ConsentManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConsentManager({ open, onOpenChange }: ConsentManagerProps) {
  const { consent, updateConsent } = useCookieConsent()

  const [localAnalytics, setLocalAnalytics] = useState(consent.analytics)
  const [localAdvertising, setLocalAdvertising] = useState(consent.advertising)

  function handleSave() {
    updateConsent({ analytics: localAnalytics, advertising: localAdvertising })
    onOpenChange(false)
  }

  function handleCancel() {
    setLocalAnalytics(consent.analytics)
    setLocalAdvertising(consent.advertising)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gestión de cookies</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <ConsentRow
            id="cookies-necessary"
            title="Cookies necesarias"
            description="Imprescindibles para el funcionamiento del sitio. No pueden desactivarse."
            checked={true}
            disabled={true}
            onCheckedChange={() => {}}
          />

          <Separator />

          <ConsentRow
            id="cookies-analytics"
            title="Cookies analíticas"
            description="Nos ayudan a entender cómo los visitantes interactúan con el sitio, de forma anónima y agregada."
            checked={localAnalytics}
            disabled={false}
            onCheckedChange={setLocalAnalytics}
          />

          <Separator />

          <ConsentRow
            id="cookies-advertising"
            title="Cookies publicitarias"
            description="Permiten mostrar publicidad personalizada según tus intereses. Pueden compartirse con terceros."
            checked={localAdvertising}
            disabled={false}
            onCheckedChange={setLocalAdvertising}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar preferencias</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ConsentRowProps {
  id: string
  title: string
  description: string
  checked: boolean
  disabled: boolean
  onCheckedChange: (value: boolean) => void
}

function ConsentRow({ id, title, description, checked, disabled, onCheckedChange }: ConsentRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-0.5 flex-1">
        <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
          {title}
        </Label>
        <p className="text-xs text-[hsl(var(--muted-foreground))] leading-snug">{description}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        aria-label={title}
        className="shrink-0 mt-0.5"
      />
    </div>
  )
}
