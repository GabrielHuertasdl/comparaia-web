export const SITE_NAME = 'ComparaIA'
export const SITE_TAGLINE = 'Comparamos las IAs para que tú elijas mejor'
export const SITE_DESCRIPTION =
  'Análisis independiente, comparativas y rankings de herramientas de inteligencia artificial. Datos verificados, metodología transparente.'
export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://comparaia.es'
export const CONTACT_EMAIL = 'hola@comparaia.es'
export const COOKIE_POLICY_VERSION = process.env.NEXT_PUBLIC_COOKIE_POLICY_VERSION ?? '2025.1'

export const NAV_LINKS = [
  { href: '/noticias', label: 'Noticias' },
  { href: '/comparativas', label: 'Comparativas' },
  { href: '/rankings', label: 'Rankings' },
  { href: '/comparador', label: 'Comparador' },
  { href: '/herramientas', label: 'Herramientas' },
  { href: '/guias', label: 'Guías' },
] as const

export const FOOTER_LINKS = {
  editorial: [
    { href: '/sobre', label: 'Sobre ComparaIA' },
    { href: '/metodologia', label: 'Metodología' },
    { href: '/contacto', label: 'Contacto' },
    { href: '/newsletter', label: 'Newsletter' },
  ],
  legal: [
    { href: '/legal/aviso-legal', label: 'Aviso legal' },
    { href: '/legal/privacidad', label: 'Privacidad' },
    { href: '/legal/cookies', label: 'Cookies' },
    { href: '/legal/afiliacion', label: 'Política de afiliación' },
    { href: '/legal/politica-editorial', label: 'Política editorial' },
    { href: '/legal/terminos', label: 'Términos de uso' },
  ],
} as const

export const OG_IMAGE_DEFAULTS = {
  width: 1200,
  height: 630,
  url: `${BASE_URL}/og-default.png`,
}
