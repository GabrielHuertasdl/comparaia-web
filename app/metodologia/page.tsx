import type { Metadata } from 'next'
import Link from 'next/link'
import { BASE_URL, SITE_NAME, CONTACT_EMAIL } from '@/lib/constants/site'
import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: `Metodología de puntuación | ${SITE_NAME}`,
  description:
    `Cómo evaluamos y puntuamos las herramientas de IA en ${SITE_NAME}: criterios, pesos, niveles de confianza, proceso editorial y política de actualización.`,
  alternates: { canonical: `${BASE_URL}/metodologia` },
  openGraph: {
    title: `Metodología | ${SITE_NAME}`,
    description: `Transparencia total: cómo evaluamos y puntuamos las herramientas de IA.`,
    url: `${BASE_URL}/metodologia`,
    type: 'website',
  },
}

export default function MetodologiaPage() {
  return (
    <>
      <Navigation />

      <main className="py-12 md:py-20">
        <div className="container-editorial">
          <header className="mb-12">
            <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4">
              Metodología
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Cómo evaluamos, puntuamos y publicamos el contenido en {SITE_NAME}.
              Transparencia total, sin excepción.
            </p>
          </header>

          {/* Sistema de puntuación */}
          <section className="mb-12 prose-editorial">
            <h2 className="font-heading text-2xl font-bold mb-4">Sistema de puntuación</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Cada modelo o herramienta de IA se evalúa según un conjunto de <strong>criterios
              ponderados por caso de uso</strong>. Los criterios relevantes para, por ejemplo,
              "programación" no son los mismos que para "generación de imágenes". Esto permite
              rankings más útiles y específicos que un ranking genérico único.
            </p>

            <h3 className="font-heading text-lg font-semibold mt-6 mb-3">Criterios generales</h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              {[
                ['Rendimiento en benchmarks', 'Resultados en evaluaciones estándar del sector (MMLU, HumanEval, MT-Bench…).'],
                ['Calidad de salida', 'Evaluación cualitativa de la coherencia, precisión y utilidad de las respuestas.'],
                ['Velocidad', 'Tokens por segundo o tiempo de respuesta en condiciones normales de uso.'],
                ['Precio y relación calidad-precio', 'Coste por token o plan mensual, ponderado por las capacidades obtenidas.'],
                ['Límite de contexto', 'Ventana de contexto máxima disponible en el plan de referencia.'],
                ['Capacidades multimodales', 'Soporte de imágenes, audio, vídeo u otras modalidades de entrada/salida.'],
                ['Facilidad de uso', 'Curva de aprendizaje, calidad de la interfaz y documentación disponible.'],
                ['Fiabilidad del servicio', 'Uptime histórico, latencia y consistencia del rendimiento.'],
              ].map(([name, desc]) => (
                <li key={name as string} className="flex gap-2">
                  <span className="mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span>
                    <strong className="text-foreground">{name}</strong> — {desc}
                  </span>
                </li>
              ))}
            </ul>

            <h3 className="font-heading text-lg font-semibold mt-6 mb-3">Pesos y normalización</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Cada criterio tiene un peso relativo (entre 0 y 1) que suma 1 por caso de uso.
              Los valores brutos se normalizan a una escala de 0 a 10 antes de aplicar los pesos.
              La puntuación final es la suma ponderada de todos los criterios normalizados.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Los pesos se revisan periódicamente con el equipo editorial y pueden ajustarse
              cuando cambian las prioridades del sector o las necesidades de los usuarios.
            </p>
          </section>

          {/* Niveles de confianza */}
          <section className="mb-12">
            <h2 className="font-heading text-2xl font-bold mb-4">Niveles de confianza</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Mostramos el nivel de confianza de cada dato para que sepas exactamente en qué
              medida puedes fiarte de una puntuación concreta.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  label: 'Verificado',
                  color: 'bg-confidence-verified/10 border-confidence-verified/30 text-confidence-verified',
                  desc: 'El dato procede de una fuente oficial (documentación del fabricante, API de precios) o ha sido testado directamente por nuestro equipo con metodología reproducible.',
                },
                {
                  label: 'Comunidad',
                  color: 'bg-confidence-community/10 border-confidence-community/30 text-confidence-community',
                  desc: 'Dato aportado o corroborado por la comunidad (foros, benchmarks de terceros, comparaciones independientes). Contrastado pero no testado directamente.',
                },
                {
                  label: 'Estimado',
                  color: 'bg-confidence-estimated/10 border-confidence-estimated/30 text-confidence-estimated',
                  desc: 'Calculado a partir de información parcial o inferido de datos indirectos. Se muestra cuando no disponemos de una medición directa pero queremos ofrecer una referencia orientativa.',
                },
                {
                  label: 'Pendiente',
                  color: 'bg-muted border-border text-muted-foreground',
                  desc: 'Dato que aún no hemos podido verificar o para el que no existe información pública suficiente. Se muestra como marcador de posición hasta completar la evaluación.',
                },
              ].map(({ label, color, desc }) => (
                <div
                  key={label}
                  className={`rounded-xl border p-5 ${color}`}
                >
                  <p className="font-semibold text-sm mb-2">{label}</p>
                  <p className="text-sm leading-relaxed opacity-90">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Proceso editorial */}
          <section className="mb-12 prose-editorial">
            <h2 className="font-heading text-2xl font-bold mb-4">Proceso editorial</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Todo el contenido publicado en {SITE_NAME} pasa por revisión humana. No publicamos
              contenido generado automáticamente sin supervisión editorial.
            </p>
            <ol className="space-y-4 text-muted-foreground text-sm list-decimal list-inside">
              <li>
                <strong className="text-foreground">Ingesta y clasificación</strong> — Las noticias
                e información sobre nuevos modelos se recopilan de fuentes primarias (blogs oficiales,
                papers, APIs de precio).
              </li>
              <li>
                <strong className="text-foreground">Borrador</strong> — Un editor prepara el
                borrador de la pieza con los datos disponibles y les asigna el nivel de confianza
                correspondiente.
              </li>
              <li>
                <strong className="text-foreground">Revisión</strong> — Un segundo revisor valida
                la exactitud de los datos y aprueba o solicita correcciones antes de la publicación.
              </li>
              <li>
                <strong className="text-foreground">Publicación</strong> — El contenido se publica
                con la fecha de publicación y, en el caso de rankings y fichas, la fecha de
                última revisión de los datos.
              </li>
            </ol>
          </section>

          {/* Afiliación */}
          <section className="mb-12 prose-editorial">
            <h2 className="font-heading text-2xl font-bold mb-4">Afiliación y transparencia económica</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {SITE_NAME} puede recibir comisiones de afiliado cuando los lectores contratan
              herramientas a través de nuestros enlaces. Esta financiación nos ayuda a mantener
              el medio operativo.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Sin embargo, los acuerdos de afiliación no condicionan las puntuaciones ni el
              posicionamiento en rankings. Las herramientas con las que tenemos acuerdo de afiliado
              son evaluadas con los mismos criterios que el resto.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Todos los enlaces de afiliado están marcados con un indicador visible en la
              página. No aceptamos contenido patrocinado no declarado ni reseñas pagadas.
            </p>
          </section>

          {/* Frecuencia de actualización */}
          <section className="mb-12 prose-editorial">
            <h2 className="font-heading text-2xl font-bold mb-4">Frecuencia de actualización</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              El mundo de la IA cambia constantemente. Seguimos esta cadencia de revisión:
            </p>
            <ul className="space-y-2 text-muted-foreground text-sm">
              {[
                ['Rankings', 'Revisión completa mensual. Actualizaciones parciales cuando se anuncian cambios significativos de modelos o precios.'],
                ['Fichas de herramientas', 'Revisión trimestral o cuando se detecta un cambio relevante en el producto.'],
                ['Comparativas', 'Revisión semestral. Se indica la fecha de última actualización en la cabecera del artículo.'],
                ['Noticias', 'Publicación continua. Los artículos de noticias no se actualizan salvo errores factuales.'],
              ].map(([type, policy]) => (
                <li key={type as string} className="flex gap-2">
                  <span className="mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>
                    <strong className="text-foreground">{type}</strong> — {policy}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Datos pendientes */}
          <section className="mb-12 prose-editorial">
            <h2 className="font-heading text-2xl font-bold mb-4">Política de datos pendientes</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Cuando no disponemos de datos suficientes para una puntuación fiable, utilizamos
              el nivel de confianza "Pendiente" y mostramos el campo vacío o con el indicador
              correspondiente. Nunca inventamos datos ni extrapolamos sin base suficiente.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Preferimos mostrar que algo es desconocido antes que ofrecer una cifra poco fiable
              sin contexto.
            </p>
          </section>

          {/* Contacto */}
          <div className="rounded-xl border border-border bg-muted/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold">¿Detectas un error en nuestros datos?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Escríbenos. Investigamos y corregimos en menos de 48 horas.
              </p>
            </div>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors flex-shrink-0"
            >
              Contactar
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
