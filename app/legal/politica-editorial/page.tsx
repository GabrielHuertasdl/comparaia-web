import type { Metadata } from 'next'
import { db } from '@/lib/db'
import LegalPageLayout from '@/components/legal/LegalPageLayout'

export const metadata: Metadata = {
  title: 'Política Editorial',
  description: 'Metodología, criterios de independencia y estándares editoriales de ComparaIA.',
  robots: { index: false, follow: false },
}

const PLACEHOLDER = `
<h2>1. Misión editorial</h2>
<p>ComparaIA tiene como misión ofrecer información objetiva, rigurosa e independiente sobre modelos y
herramientas de inteligencia artificial en español, ayudando a usuarios y empresas a tomar decisiones
informadas.</p>

<h2>2. Independencia y transparencia</h2>
<p>Nuestros análisis y puntuaciones son editorialmente independientes de los fabricantes y patrocinadores.
Ninguna empresa puede pagar por obtener una valoración positiva. Las relaciones comerciales (afiliación,
publicidad) están claramente identificadas y no influyen en el contenido editorial.</p>

<h2>3. Metodología de evaluación</h2>
<p>Evaluamos los modelos y herramientas de IA según criterios objetivos y reproducibles:</p>
<ul>
  <li><strong>Rendimiento técnico:</strong> pruebas estandarizadas y benchmarks públicos.</li>
  <li><strong>Precio y relación calidad-precio:</strong> comparativa de planes y limitaciones.</li>
  <li><strong>Experiencia de usuario:</strong> usabilidad, documentación y soporte.</li>
  <li><strong>Privacidad y seguridad:</strong> política de datos, cumplimiento RGPD.</li>
</ul>
<p>Las puntuaciones se actualizan periódicamente para reflejar los cambios en el mercado.</p>

<h2>4. Fuentes y verificación</h2>
<p>Citamos las fuentes de todos los datos relevantes. Las afirmaciones que no podamos verificar de forma
independiente se indican explícitamente. Corregimos los errores con transparencia.</p>

<h2>5. Proceso de revisión</h2>
<p>Todos los artículos pasan por un proceso de revisión interna antes de su publicación. Los artículos de
análisis profundo son revisados por al menos un segundo editor.</p>

<h2>6. Correcciones</h2>
<p>Si detectas un error en nuestros contenidos, puedes reportarlo en <strong>editorial@comparaia.es</strong>.
Las correcciones significativas se documentan al final del artículo afectado.</p>

<h2>7. Conflictos de interés</h2>
<p>Cualquier relación comercial relevante con los productos analizados se declara en el propio artículo.
Los miembros del equipo editorial no pueden evaluar herramientas en las que tengan interés económico
directo.</p>
`

export default async function PoliticaEditorialPage() {
  const doc = await db.legalDocument.findFirst({
    where: { type: 'POLITICA_EDITORIAL' },
  })

  return (
    <LegalPageLayout
      title="Política Editorial"
      content={doc?.content ?? PLACEHOLDER}
      effectiveAt={doc?.effectiveAt}
      isDraft={!doc || doc.version === 'DRAFT'}
    />
  )
}
