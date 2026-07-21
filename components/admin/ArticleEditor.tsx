'use client'

import { useState, useEffect } from 'react'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils/cn'
import { slugify } from '@/lib/utils/slug'

interface ArticleEditorArticle {
  id: string
  title: string
  excerpt: string
  body: string
  metaTitle?: string | null
  metaDescription?: string | null
  slug: string
  status: string
  keyPoints: string[]
  sourceUrl?: string | null
}

interface ArticleEditorProps {
  article: ArticleEditorArticle
  onSave: (data: Partial<ArticleEditorArticle>) => Promise<void>
}

function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'flex w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

const EXCERPT_MAX = 160

export function ArticleEditor({ article, onSave }: ArticleEditorProps) {
  const [title, setTitle] = useState(article.title)
  const [slug, setSlug] = useState(article.slug)
  const [slugManual, setSlugManual] = useState(false)
  const [excerpt, setExcerpt] = useState(article.excerpt)
  const [body, setBody] = useState(article.body)
  const [metaTitle, setMetaTitle] = useState(article.metaTitle ?? '')
  const [metaDescription, setMetaDescription] = useState(article.metaDescription ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!slugManual) {
      setSlug(slugify(title))
    }
  }, [title, slugManual])

  async function handleSave() {
    setSaving(true)
    try {
      await onSave({
        title,
        slug,
        excerpt,
        body,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Title + Slug */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="ae-title">Título</Label>
          <Input
            id="ae-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del artículo"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ae-slug">Slug</Label>
          <Input
            id="ae-slug"
            value={slug}
            onChange={(e) => {
              setSlugManual(true)
              setSlug(e.target.value)
            }}
            placeholder="slug-del-articulo"
          />
          {!slugManual && (
            <p className="text-xs text-muted-foreground">Auto-generado desde el título</p>
          )}
        </div>
      </div>

      {/* Excerpt */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="ae-excerpt">Extracto</Label>
          <span
            className={cn(
              'text-xs tabular-nums',
              excerpt.length > EXCERPT_MAX ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            {excerpt.length}/{EXCERPT_MAX}
          </span>
        </div>
        <Textarea
          id="ae-excerpt"
          rows={3}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Resumen breve del artículo (máx. 160 caracteres)"
          maxLength={EXCERPT_MAX + 20}
        />
      </div>

      {/* Body */}
      <div className="space-y-1.5">
        <Label htmlFor="ae-body">Cuerpo (MDX)</Label>
        <Textarea
          id="ae-body"
          className="min-h-64 font-mono text-xs"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Contenido completo en formato MDX..."
        />
      </div>

      <Separator />

      {/* SEO Meta */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-foreground">SEO</p>
        <div className="space-y-1.5">
          <Label htmlFor="ae-meta-title">Meta título</Label>
          <Input
            id="ae-meta-title"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder={title}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ae-meta-desc">Meta descripción</Label>
          <Textarea
            id="ae-meta-desc"
            rows={2}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder={excerpt}
          />
        </div>
      </div>

      <Separator />

      {/* Key points (read-only reference) */}
      {article.keyPoints.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Puntos clave{' '}
            <span className="font-normal text-muted-foreground">(referencia de ingesta)</span>
          </p>
          <ul className="space-y-1 rounded-md border border-border bg-muted/40 p-3">
            {article.keyPoints.map((point, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <span className="shrink-0 select-none text-muted-foreground/50">{i + 1}.</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Source URL */}
      {article.sourceUrl && (
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">Fuente original</p>
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            {article.sourceUrl}
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          </a>
        </div>
      )}

      {/* Save */}
      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={saving || excerpt.length > EXCERPT_MAX}>
          {saving ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>
    </div>
  )
}
