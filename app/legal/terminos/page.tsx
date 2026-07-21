import type { Metadata } from 'next'
import { db } from '@/lib/db'
import LegalPageLayout from '@/components/legal/LegalPageLayout'

export const metadata: Metadata = {
  title: 'Términos de Uso',
  description: 'Términos y condiciones de uso del sitio web ComparaIA.',
  robots: { index: false, follow: false },
}

const PLACEHOLDER = `
<h2>1. Aceptación de los términos</h2>
<p>El acceso y uso del sitio web comparaia.es implica la aceptación plena de estos Términos de Uso.
Si no estás de acuerdo con alguno de ellos, te rogamos que no utilices el sitio.</p>

<h2>2. Uso permitido</h2>
<p>El sitio web está destinado exclusivamente a un uso personal e informativo. Queda prohibido:</p>
<ul>
  <li>Realizar scraping masivo o automatizado del contenido.</li>
  <li>Reproducir o distribuir el contenido sin autorización previa por escrito.</li>
  <li>Utilizar el sitio para actividades ilegales o contrarias a la buena fe.</li>
  <li>Intentar acceder sin autorización a los sistemas internos.</li>
</ul>

<h2>3. Contenido de usuario</h2>
<p>Si el sitio permite publicar comentarios u otro contenido generado por el usuario, eres responsable
de que este sea veraz, lícito y respetuoso. Nos reservamos el derecho de eliminar contenidos que
incumplan estas condiciones.</p>

<h2>4. Exactitud de la información</h2>
<p>Hacemos nuestro mejor esfuerzo para mantener la información actualizada y precisa, pero no garantizamos
la exactitud completa de los datos técnicos o de precios, que pueden cambiar sin previo aviso.
Verifica siempre la información directamente con el proveedor antes de tomar decisiones importantes.</p>

<h2>5. Limitación de responsabilidad</h2>
<p>ComparaIA no será responsable por daños directos, indirectos o consecuentes derivados del uso o
imposibilidad de uso del sitio, ni de las decisiones tomadas basándose en la información publicada.</p>

<h2>6. Modificación de los términos</h2>
<p>Nos reservamos el derecho de actualizar estos Términos de Uso. Los cambios sustanciales se comunicarán
a través del sitio web. El uso continuado del sitio tras los cambios implica su aceptación.</p>

<h2>7. Ley aplicable</h2>
<p>Estos términos se rigen por la legislación española. Cualquier disputa se someterá a los tribunales
competentes de España.</p>

<h2>8. Contacto</h2>
<p>Para cualquier cuestión relacionada con estos términos, contacta en <strong>legal@comparaia.es</strong>.</p>
`

export default async function TerminosPage() {
  const doc = await db.legalDocument.findFirst({
    where: { type: 'TERMINOS' },
  })

  return (
    <LegalPageLayout
      title="Términos de Uso"
      content={doc?.content ?? PLACEHOLDER}
      effectiveAt={doc?.effectiveAt}
      isDraft={!doc || doc.version === 'DRAFT'}
    />
  )
}
