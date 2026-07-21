import type { Metadata } from 'next'
import { db } from '@/lib/db'
import LegalPageLayout from '@/components/legal/LegalPageLayout'
import CookiesPreferencesButton from '@/components/legal/CookiesPreferencesButton'

export const metadata: Metadata = {
  title: 'Política de Cookies',
  description: 'Información sobre el uso de cookies en ComparaIA y cómo gestionarlas.',
  robots: { index: false, follow: false },
}

const PLACEHOLDER = `
<h2>1. ¿Qué son las cookies?</h2>
<p>Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo cuando los
visitas. Sirven para recordar tus preferencias, analizar el tráfico del sitio y personalizar la
experiencia de usuario.</p>

<h2>2. Cookies que utilizamos</h2>
<h3>Cookies estrictamente necesarias</h3>
<p>Son imprescindibles para el funcionamiento del sitio. No requieren tu consentimiento. Incluyen las
cookies de sesión y de seguridad.</p>

<h3>Cookies analíticas</h3>
<p>Nos permiten entender cómo interactúan los usuarios con el sitio mediante herramientas como Google
Analytics. Solo se activan con tu consentimiento.</p>

<h3>Cookies publicitarias</h3>
<p>Se usan para mostrarte anuncios relevantes basados en tus intereses. Solo se activan con tu
consentimiento.</p>

<h2>3. Gestión del consentimiento</h2>
<p>Puedes aceptar, rechazar o personalizar el uso de cookies mediante nuestro panel de preferencias.
Puedes modificar tu elección en cualquier momento desde esta página.</p>

<h2>4. Cookies de terceros</h2>
<p>Algunos de nuestros socios pueden instalar sus propias cookies. Consulta sus políticas de privacidad
para más información.</p>

<h2>5. Más información</h2>
<p>Para cualquier consulta sobre el uso de cookies, contacta con nosotros en
<strong>privacidad@comparaia.es</strong>.</p>
`

export default async function CookiesPage() {
  const doc = await db.legalDocument.findFirst({
    where: { type: 'COOKIES' },
  })

  return (
    <LegalPageLayout
      title="Política de Cookies"
      content={doc?.content ?? PLACEHOLDER}
      effectiveAt={doc?.effectiveAt}
      isDraft={!doc || doc.version === 'DRAFT'}
    >
      <CookiesPreferencesButton />
    </LegalPageLayout>
  )
}
