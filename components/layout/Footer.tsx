import Link from 'next/link'
import { Cpu, Twitter, Rss } from 'lucide-react'
import { FOOTER_LINKS, SITE_NAME, CONTACT_EMAIL, SITE_TAGLINE, SITE_DESCRIPTION } from '@/lib/constants/site'
import { Separator } from '@/components/ui/separator'

export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-heading font-bold text-lg text-foreground hover:text-primary transition-colors w-fit"
            >
              <Cpu className="h-5 w-5 text-primary" aria-hidden="true" />
              {SITE_NAME}
            </Link>
            <p className="text-sm font-medium text-foreground">{SITE_TAGLINE}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {SITE_DESCRIPTION}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <a
                href="https://twitter.com/comparaia_es"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Síguenos en Twitter"
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Twitter className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="/feed.xml"
                aria-label="Feed RSS"
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Rss className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Col 2: Editorial */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Editorial</h3>
            <ul className="flex flex-col gap-2">
              {FOOTER_LINKS.editorial.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Legal */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="flex flex-col gap-2">
              {FOOTER_LINKS.legal.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Newsletter</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Análisis semanales, comparativas y novedades de IA directamente en tu bandeja de entrada.
            </p>
            <Link
              href="/newsletter"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-4 py-2 mt-1 w-fit"
            >
              Suscribirse
            </Link>
            <p className="text-xs text-muted-foreground mt-1">
              Sin spam. Baja cuando quieras.{' '}
              <Link href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-foreground transition-colors">
                {CONTACT_EMAIL}
              </Link>
            </p>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground">
          <span>© 2025 {SITE_NAME}. Todos los derechos reservados.</span>
          <span className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-1">
            <span>Medio independiente. Sin financiación de fabricantes de IA.</span>
            <span className="hidden sm:inline text-border">·</span>
            <Link href="/legal/afiliacion" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Algunos enlaces son de afiliado
            </Link>
          </span>
        </div>
      </div>
    </footer>
  )
}
