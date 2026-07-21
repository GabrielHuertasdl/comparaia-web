'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// Map known path segments to readable Spanish labels
const SEGMENT_LABELS: Record<string, string> = {
  noticias: 'Noticias',
  comparativas: 'Comparativas',
  rankings: 'Rankings',
  comparador: 'Comparador',
  herramientas: 'Herramientas',
  guias: 'Guías',
  sobre: 'Sobre ComparaIA',
  metodologia: 'Metodología',
  contacto: 'Contacto',
  newsletter: 'Newsletter',
  legal: 'Legal',
  'aviso-legal': 'Aviso legal',
  privacidad: 'Privacidad',
  cookies: 'Cookies',
  afiliacion: 'Política de afiliación',
  'politica-editorial': 'Política editorial',
  terminos: 'Términos de uso',
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ')
}

function segmentToLabel(segment: string): string {
  return SEGMENT_LABELS[segment] ?? capitalize(segment)
}

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  const pathname = usePathname()

  const resolvedItems: BreadcrumbItem[] = items ?? (() => {
    const segments = pathname.split('/').filter(Boolean)
    const crumbs: BreadcrumbItem[] = [{ label: 'Inicio', href: '/' }]
    let accumulated = ''
    segments.forEach((segment, index) => {
      accumulated += `/${segment}`
      const isLast = index === segments.length - 1
      crumbs.push({
        label: segmentToLabel(segment),
        href: isLast ? undefined : accumulated,
      })
    })
    return crumbs
  })()

  if (resolvedItems.length <= 1) return null

  return (
    <nav aria-label="Breadcrumb" className={cn(className)}>
      <ol className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
        {resolvedItems.map((item, index) => {
          const isFirst = index === 0
          const isLast = index === resolvedItems.length - 1

          return (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/60" aria-hidden="true" />
              )}
              {isFirst ? (
                item.href ? (
                  <Link
                    href={item.href}
                    aria-label="Inicio"
                    className="flex items-center hover:text-foreground transition-colors"
                  >
                    <Home className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                ) : (
                  <Home className="h-3.5 w-3.5" aria-hidden="true" />
                )
              ) : isLast || !item.href ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={cn(isLast && 'text-foreground font-medium')}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
