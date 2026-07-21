'use client'

import { useState } from 'react'
import { Pencil, Trash2, Plus, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils/cn'
import { formatDateShort } from '@/lib/utils/format'

interface Source {
  id: string
  name: string
  url: string
  type: string
  active: boolean
  lastFetchAt?: Date | null
}

interface SourceManagerProps {
  sources: Source[]
}

const SOURCE_TYPES = ['RSS', 'API', 'MANUAL'] as const
type SourceType = (typeof SOURCE_TYPES)[number]

interface SourceForm {
  name: string
  url: string
  type: SourceType
  active: boolean
}

const EMPTY_FORM: SourceForm = { name: '', url: '', type: 'RSS', active: true }

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export function SourceManager({ sources: initialSources }: SourceManagerProps) {
  const [sources, setSources] = useState<Source[]>(initialSources)
  const [dialog, setDialog] = useState<{ mode: 'add' | 'edit'; source?: Source } | null>(null)
  const [form, setForm] = useState<SourceForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function openAdd() {
    setForm(EMPTY_FORM)
    setDialog({ mode: 'add' })
  }

  function openEdit(source: Source) {
    setForm({ name: source.name, url: source.url, type: source.type as SourceType, active: source.active })
    setDialog({ mode: 'edit', source })
  }

  function closeDialog() {
    if (!saving) setDialog(null)
  }

  function patchForm<K extends keyof SourceForm>(key: K, value: SourceForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (dialog?.mode === 'add') {
        const res = await fetch('/api/editorial/sources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const created: Source = await res.json()
        setSources((prev) => [...prev, created])
      } else if (dialog?.mode === 'edit' && dialog.source) {
        await fetch(`/api/editorial/sources/${dialog.source.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        setSources((prev) =>
          prev.map((s) => (s.id === dialog.source!.id ? { ...s, ...form } : s)),
        )
      }
      setDialog(null)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(source: Source) {
    setTogglingId(source.id)
    try {
      await fetch(`/api/editorial/sources/${source.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !source.active }),
      })
      setSources((prev) =>
        prev.map((s) => (s.id === source.id ? { ...s, active: !s.active } : s)),
      )
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta fuente?')) return
    setDeletingId(id)
    try {
      await fetch(`/api/editorial/sources/${id}`, { method: 'DELETE' })
      setSources((prev) => prev.filter((s) => s.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  const formValid = form.name.trim() !== '' && form.url.trim() !== ''

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{sources.length} fuentes configuradas</p>
        <Button size="sm" onClick={openAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          Añadir fuente
        </Button>
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Activa</TableHead>
              <TableHead>Última ingesta</TableHead>
              <TableHead className="w-20 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Sin fuentes. Añade la primera.
                </TableCell>
              </TableRow>
            )}
            {sources.map((source) => (
              <TableRow key={source.id}>
                <TableCell className="font-medium">{source.name}</TableCell>
                <TableCell>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-[200px] items-center gap-1 truncate text-primary hover:underline"
                  >
                    <span className="truncate">{source.url}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{source.type}</Badge>
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    disabled={togglingId === source.id}
                    onClick={() => handleToggle(source)}
                    className={cn(
                      'inline-flex h-5 w-9 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                      source.active ? 'bg-primary' : 'bg-muted',
                    )}
                    aria-checked={source.active}
                    role="switch"
                  >
                    <span
                      className={cn(
                        'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform',
                        source.active ? 'translate-x-4' : 'translate-x-0',
                      )}
                    />
                  </button>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {source.lastFetchAt ? formatDateShort(source.lastFetchAt) : '—'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEdit(source)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      disabled={deletingId === source.id}
                      onClick={() => handleDelete(source.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {dialog && (
        <Dialog open onOpenChange={closeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialog.mode === 'add' ? 'Añadir fuente' : 'Editar fuente'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="sm-name">Nombre</Label>
                <Input
                  id="sm-name"
                  value={form.name}
                  onChange={(e) => patchForm('name', e.target.value)}
                  placeholder="The Verge AI"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sm-url">URL</Label>
                <Input
                  id="sm-url"
                  type="url"
                  value={form.url}
                  onChange={(e) => patchForm('url', e.target.value)}
                  placeholder="https://…"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sm-type">Tipo</Label>
                <Select
                  value={form.type}
                  onValueChange={(val) => patchForm('type', val as SourceType)}
                >
                  <SelectTrigger id="sm-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeDialog} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving || !formValid}>
                {saving ? 'Guardando…' : 'Guardar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
