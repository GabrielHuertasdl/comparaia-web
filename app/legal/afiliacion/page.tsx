import type { Metadata } from 'next'
import { db } from '@/lib/db'
import LegalPageLayout from '@/components/legal/LegalPageLayout'

export const metadata: Metadata = {
  title: 'Política de Afiliación',
  description: 'Información sobre los acuerdos de afiliación y su impacto en el contenido de ComparaIA.',
  robots: { index: false, follow: false },
}

const PLACEHOLDER = `
<h2>1. Qué es la afiliación</h2>
<p>ComparaIA participa en programas de afiliación con algunas de las empresas cuyos productos analizamos.
Esto significa que, cuando haces clic en ciertos enlaces de nuestra web y realizas una compra o registro,
podemos recibir una comisión sin coste adicional para ti.</p>

<h2>2. Identificación de enlaces de afiliado</h2>
<p>Los enlaces de afiliado están claramente marcados en la interfaz (etiqueta "Enlace de afiliado" o
similar). Nunca ocultamos nuestra relación comercial con ningún proveedor.</p>

<h2>3. Impacto en el contenido editorial</h2>
<p>La existencia de un acuerdo de afiliación <strong>no influye en nuestras valoraciones ni puntuaciones</strong>.
Evaluamos todos los productos de forma objetiva siguiendo la misma metodología independientemente de si
tenemos o no relación comercial con el proveedor. Un producto puede recibir una puntuación baja incluso
si somos afiliados.</p>

<h2>4. Transparencia</h2>
<p>Publicamos esta política de conformidad con el artículo 20 de la LSSI-CE y las directrices de la
Comisión Federal de Comercio (FTC) para comunicaciones comerciales en internet.</p>

<h2>5. Proveedores actuales</h2>
<p>Mantenemos acuerdos de afiliación con proveedores de herramientas de IA. La lista completa de socios
comerciales está disponible bajo petición en <strong>comercial@comparaia.es</strong>.</p>

<h2>6. Contacto</h2>
<p>Para cualquier pregunta sobre nuestros acuerdos de afiliación o para proponer una colaboración
comercial, contáctanos en <strong>comercial@comparaia.es</strong>.</p>
`

export default async function AfiliacionPage() {
  const doc = await db.legalDocument.findFirst({
    where: { type: 'AFILIACION' },
  })

  return (
    <LegalPageLayout
      title="Política de Afiliación"
      content={doc?.content ?? PLACEHOLDER}
      effectiveAt={doc?.effectiveAt}
      isDraft={!doc || doc.version === 'DRAFT'}
    />
  )
}
