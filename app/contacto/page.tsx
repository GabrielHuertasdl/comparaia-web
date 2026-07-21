import type { Metadata } from 'next'
import { Mail } from 'lucide-react'
import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import { BASE_URL, SITE_NAME, CONTACT_EMAIL } from '@/lib/constants/site'

export const metadata: Metadata = {
  title: `Contacto | ${SITE_NAME}`,
  description: `Contacta con el equipo de ${SITE_NAME}. Correcciones, colaboraciones, errores de datos o cualquier consulta editorial.`,
  alternates: { canonical: `${BASE_URL}/contacto` },
  openGraph: {
    title: `Contacto | ${SITE_NAME}`,
    description: `Escríbenos al equipo de ${SITE_NAME}.`,
    url: `${BASE_URL}/contacto`,
    type: 'website',
  },
}

export default function ContactoPage() {
  return (
    <>
      <Navigation />

      <main className="py-12 md:py-20">
        <div className="container-editorial">
          <header className="mb-10">
            <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4">Contacto</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              ¿Tienes alguna pregunta, corrección o propuesta? Escríbenos directamente.
            </p>
          </header>

          {/* Email card */}
          <div className="rounded-2xl border border-border bg-card p-8 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 flex-shrink-0">
              <Mail className="h-7 w-7 text-primary" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Dirección de correo electrónico</p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-heading text-2xl font-semibold text-primary hover:underline underline-offset-4 transition-colors"
              >
                {CONTACT_EMAIL}
              </a>
              <p className="text-sm text-muted-foreground mt-1">
                Respondemos en un plazo máximo de 48 horas en días laborables.
              </p>
            </div>
          </div>

          {/* Motivos de contacto */}
          <section className="mb-10">
            <h2 className="font-heading text-xl font-bold mb-5">Motivos habituales de contacto</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: 'Correcciones de datos',
                  body: 'Si detectas un error en una puntuación, precio o dato técnico, indícanos el artículo y el dato incorrecto. Lo revisamos en menos de 48 horas.',
                },
                {
                  title: 'Sugerencias de herramientas',
                  body: 'Si conoces una herramienta de IA que no está en nuestra base de datos y crees que deberíamos analizar, escríbenos.',
                },
                {
                  title: 'Colaboraciones editoriales',
                  body: 'Si eres especialista en un área relacionada con la IA y te interesa colaborar como revisor externo, cuéntanos tu perfil.',
                },
                {
                  title: 'Prensa y medios',
                  body: 'Para consultas de medios de comunicación, peticiones de datos o entrevistas, contacta también por este mismo correo.',
                },
              ].map(({ title, body }) => (
                <div
                  key={title}
                  className="rounded-xl border border-border bg-card p-5 flex flex-col gap-2"
                >
                  <h3 className="font-semibold text-sm">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Nota sobre publicidad */}
          <div className="rounded-xl border border-border bg-muted/30 p-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Nota:</strong> No aceptamos contenido
              patrocinado no declarado, reseñas pagadas ni solicitudes de modificar puntuaciones
              a cambio de contraprestación económica. Las consultas de este tipo no reciben
              respuesta.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
