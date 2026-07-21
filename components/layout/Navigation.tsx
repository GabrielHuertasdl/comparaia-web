'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Menu, X, Moon, Sun, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { NAV_LINKS, SITE_NAME } from '@/lib/constants/site'

export default function Navigation() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-heading font-bold text-xl text-foreground hover:text-primary transition-colors"
        >
          <Cpu className="h-5 w-5 text-primary" aria-hidden="true" />
          {SITE_NAME}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Navegación principal">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === href || pathname.startsWith(href + '/')
                  ? 'text-primary underline decoration-2 underline-offset-4'
                  : 'text-muted-foreground',
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <Button asChild variant="default" size="sm">
            <Link href="/comparador">Comparar ahora</Link>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileOpen}
          className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <nav aria-label="Navegación móvil" className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-foreground',
                  pathname === href || pathname.startsWith(href + '/')
                    ? 'text-primary bg-accent'
                    : 'text-muted-foreground',
                )}
              >
                {label}
              </Link>
            ))}
            <div className="flex items-center gap-3 px-3 pt-3 mt-2 border-t border-border">
              <button
                onClick={toggleTheme}
                aria-label="Cambiar tema"
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
              <Button asChild variant="default" size="sm" className="flex-1">
                <Link href="/comparador" onClick={() => setMobileOpen(false)}>
                  Comparar ahora
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
