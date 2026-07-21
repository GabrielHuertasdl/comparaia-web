import type { Metadata } from 'next'
import { db } from '@/lib/db'
import LegalPageLayout from '@/components/legal/LegalPageLayout'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad y protección de datos de ComparaIA.',
  robots: { index: false, follow: false },
}

const PLACEHOLDER = `
<h2>1. Responsable del tratamiento</h2>
<p>El responsable del tratamiento de los datos personales recabados a través de comparaia.es es el titular
identificado en el Aviso Legal.</p>

<h2>2. Finalidad del tratamiento</h2>
<p>Los datos personales que nos facilites se tratarán para:</p>
<ul>
  <li>Gestionar tu suscripción a la newsletter.</li>
  <li>Responder a tus consultas o solicitudes de contacto.</li>
  <li>Mejorar los servicios y la experiencia de usuario mediante análisis estadístico.</li>
  <li>Cumplir con obligaciones legales aplicables.</li>
</ul>

<h2>3. Legitimación</h2>
<p>La base jurídica del tratamiento es tu consentimiento expreso (art. 6.1.a RGPD), el cumplimiento de una
relación contractual (art. 6.1.b RGPD) y el interés legítimo del responsable (art. 6.1.f RGPD).</p>

<h2>4. Destinatarios</h2>
<p>Los datos no serán cedidos a terceros salvo obligación legal. Utilizamos proveedores de servicios de
confianza (hosting, analítica, correo electrónico) que actúan como encargados del tratamiento bajo
contrato de garantías adecuadas.</p>

<h2>5. Transferencias internacionales</h2>
<p>Algunos proveedores pueden estar ubicados fuera del Espacio Económico Europeo. En tal caso, garantizamos
el nivel de protección adecuado mediante cláusulas contractuales tipo aprobadas por la Comisión Europea.</p>

<h2>6. Plazo de conservación</h2>
<p>Los datos se conservarán mientras se mantenga la relación y no se solicite su supresión, así como durante
los plazos legalmente exigidos.</p>

<h2>7. Derechos del interesado</h2>
<p>Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y
portabilidad escribiendo a <strong>privacidad@comparaia.es</strong>. También tienes derecho a presentar
una reclamación ante la Agencia Española de Protección de Datos (aepd.es).</p>

<h2>8. Seguridad</h2>
<p>Aplicamos medidas técnicas y organizativas apropiadas para garantizar la seguridad de tus datos y
prevenir su pérdida, uso indebido o acceso no autorizado.</p>
`

export default async function PrivacidadPage() {
  const doc = await db.legalDocument.findFirst({
    where: { type: 'PRIVACIDAD' },
  })

  return (
    <LegalPageLayout
      title="Política de Privacidad"
      content={doc?.content ?? PLACEHOLDER}
      effectiveAt={doc?.effectiveAt}
      isDraft={!doc || doc.version === 'DRAFT'}
    />
  )
}
