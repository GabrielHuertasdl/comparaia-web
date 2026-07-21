'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Settings2 } from 'lucide-react'
import { ConsentManager } from './ConsentManager'

export default function CookiesPreferencesButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Settings2 className="h-4 w-4" aria-hidden="true" />
        Gestionar preferencias
      </Button>
      <ConsentManager open={open} onOpenChange={setOpen} />
    </>
  )
}
