import type { Metadata } from 'next'
import { db } from '@/lib/db'
import LegalPageLayout from '@/components/legal/LegalPageLayout'

export const metadata: Metadata = {
  title: 'Aviso Legal',
  description: 'Aviso legal e información corporativa de ComparaIA.',
  robots: { index: false, follow: false },
}

const PLACEHOLDER = `
<h2>1. Datos del titular</h2>
<p>En cumplimiento con el deber de información recogido en el artículo 10 de la Ley 34/2002, de 11 de julio,
de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se informa de los
siguientes datos identificativos del titular del sitio web <strong>comparaia.es</strong>:</p>
<ul>
  <li><strong>Titular:</strong> [Nombre o razón social]</li>
  <li><strong>NIF/CIF:</strong> [Número de identificación fiscal]</li>
  <li><strong>Domicilio:</strong> [Dirección completa], España</li>
  <li><strong>Correo electrónico:</strong> legal@comparaia.es</li>
</ul>

<h2>2. Objeto</h2>
<p>El presente aviso legal regula el uso del sitio web comparaia.es, del que es titular el responsable indicado
anteriormente. La navegación por el sitio web atribuye la condición de usuario del mismo e implica la
aceptación plena y sin reservas de todas las disposiciones incluidas en este aviso legal.</p>

<h2>3. Propiedad intelectual e industrial</h2>
<p>Los contenidos del sitio web (textos, fotografías, gráficos, logotipos, iconos, software, etc.) son
propiedad del titular o de terceros autorizados, y están protegidos por la legislación española e
internacional sobre propiedad intelectual e industrial.</p>
<p>Queda expresamente prohibida la reproducción, distribución, comunicación pública o transformación total
o parcial de los contenidos sin la autorización previa y por escrito del titular.</p>

<h2>4. Responsabilidad</h2>
<p>El titular no se hace responsable de los daños derivados del uso del sitio web, de la inexactitud o
desactualización de los contenidos, ni de la presencia de virus u otros elementos que puedan dañar los
sistemas informáticos de los usuarios.</p>

<h2>5. Ley aplicable y jurisdicción</h2>
<p>Este aviso legal se rige por la legislación española. Cualquier controversia derivada del acceso o uso del
sitio web se someterá a los Juzgados y Tribunales de España.</p>
`

export default async function AvisoLegalPage() {
  const doc = await db.legalDocument.findFirst({
    where: { type: 'AVISO_LEGAL' },
  })

  return (
    <LegalPageLayout
      title="Aviso Legal"
      content={doc?.content ?? PLACEHOLDER}
      effectiveAt={doc?.effectiveAt}
      isDraft={!doc || doc.version === 'DRAFT'}
    />
  )
}
