import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, BarChart3, RefreshCw } from 'lucide-react'
import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import { BASE_URL, SITE_NAME, CONTACT_EMAIL } from '@/lib/constants/site'

export const metadata: Metadata = {
  title: `Sobre ${SITE_NAME} — Quiénes somos y nuestra misión`,
  description:
    `${SITE_NAME} es un medio independiente de análisis de herramientas de inteligencia artificial. Conoce nuestra misión, valores y equipo editorial.`,
  alternates: { canonical: `${BASE_URL}/sobre` },
  openGraph: {
    title: `Sobre ${SITE_NAME}`,
    description: `Conoce la misión, valores y equipo editorial de ${SITE_NAME}.`,
    url: `${BASE_URL}/sobre`,
    type: 'website',
  },
}

export default function SobrePage() {
  return (
    <>
      <Navigation />

      <main className="py-12 md:py-20">
        <div className="container-editorial">
          {/* Header */}
          <header className="mb-12">
            <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4">
              Sobre {SITE_NAME}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Un medio independiente dedicado al análisis de herramientas de inteligencia
              artificial para usuarios hispanohablantes.
            </p>
          </header>

          {/* Nuestra misión */}
          <section className="mb-12 prose-editorial">
            <h2 className="font-heading text-2xl font-bold mb-4">Nuestra misión</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              El ecosistema de IA evoluciona a una velocidad que hace difícil saber qué herramienta
              es la más adecuada para cada necesidad. Hay cientos de modelos, precios que cambian
              cada mes y promesas de marketing que rara vez coinciden con el rendimiento real.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              En {SITE_NAME} creemos que los usuarios merecen información objetiva, en español
              y con metodología transparente. Nuestra misión es sencilla: <strong>comparamos las IAs
              para que tú elijas mejor</strong>.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              No somos un agregador automático de fichas de producto. Cada análisis pasa por
              revisión editorial humana, cada puntuación incluye su nivel de confianza y cada
              enlace de afiliado se declara explícitamente.
            </p>
          </section>

          {/* Valores */}
          <section className="mb-12">
            <h2 className="font-heading text-2xl font-bold mb-6">Nuestros valores</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  Icon: ShieldCheck,
                  title: 'Independencia',
                  body: 'No recibimos financiación de ningún fabricante de IA. Las puntuaciones y rankings son editorialmente independientes de los acuerdos de afiliación.',
                },
                {
                  Icon: BarChart3,
                  title: 'Transparencia',
                  body: 'Publicamos nuestra metodología de puntuación, los pesos de cada criterio y el nivel de confianza de cada dato. Si un número es una estimación, lo decimos.',
                },
                {
                  Icon: RefreshCw,
                  title: 'Actualización',
                  body: 'El mundo de la IA cambia rápido. Revisamos rankings y fichas periódicamente y registramos la fecha de última actualización en cada pieza de contenido.',
                },
              ].map(({ Icon, title, body }) => (
                <div
                  key={title}
                  className="flex flex-col gap-3 p-6 rounded-xl border border-border bg-card"
                >
                  <Icon className="h-7 w-7 text-primary" />
                  <h3 className="font-heading font-semibold text-base">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Metodología */}
          <section className="mb-12 prose-editorial">
            <h2 className="font-heading text-2xl font-bold mb-4">Metodología (resumen)</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Evaluamos cada herramienta de IA según criterios ponderados por caso de uso:
              rendimiento en benchmarks estándar, precio y relación calidad-precio, facilidad de uso,
              velocidad, límites de contexto, capacidades multimodales y calidad del soporte.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Cada dato incluye un indicador de confianza: <em>verificado</em> (testado por nuestro
              equipo o fuente oficial), <em>comunidad</em> (datos de la comunidad contrastados) o{' '}
              <em>estimado</em> (calculado a partir de información parcial).
            </p>
            <div className="mt-6">
              <Link
                href="/metodologia"
                className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
              >
                Leer la metodología completa <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          {/* Equipo */}
          <section className="mb-12 prose-editorial">
            <h2 className="font-heading text-2xl font-bold mb-4">Equipo editorial</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {SITE_NAME} es mantenido por un equipo editorial pequeño especializado en tecnología
              e inteligencia artificial. Todos los artículos, rankings y comparativas pasan
              por revisión humana antes de publicarse.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Colaboramos con revisores externos con experiencia en los sectores que analizamos
              (programación, marketing, educación, diseño…) para garantizar que las valoraciones
              sean relevantes para los usuarios reales de cada herramienta.
            </p>
          </section>

          {/* Afiliación */}
          <section className="mb-12 prose-editorial">
            <h2 className="font-heading text-2xl font-bold mb-4">Política de afiliación</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Algunos enlaces de {SITE_NAME} son enlaces de afiliado. Esto significa que si haces
              clic y contratas una herramienta, podemos recibir una comisión sin coste adicional
              para ti.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Los acuerdos de afiliación no influyen en nuestras puntuaciones ni en el contenido
              editorial. Marcamos todos los enlaces de afiliado con un indicador visible. Si tienes
              alguna duda, escríbenos a{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>

          {/* CTA contacto */}
          <div className="rounded-xl border border-border bg-muted/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold">¿Tienes alguna pregunta?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Escríbenos o consulta nuestra metodología detallada.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
              >
                Contactar
              </Link>
              <Link
                href="/metodologia"
                className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Ver metodología
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
