import type { Metadata } from 'next'
import { CheckCircle2 } from 'lucide-react'
import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import NewsletterSignup from '@/components/shared/NewsletterSignup'
import { BASE_URL, SITE_NAME } from '@/lib/constants/site'

export const metadata: Metadata = {
  title: `Newsletter | ${SITE_NAME}`,
  description: `Suscríbete a la newsletter de ${SITE_NAME}. Resumen semanal de noticias de IA, actualizaciones de rankings y comparativas exclusivas. Sin spam.`,
  alternates: { canonical: `${BASE_URL}/newsletter` },
  openGraph: {
    title: `Newsletter | ${SITE_NAME}`,
    description: `Resumen semanal de IA directamente en tu bandeja de entrada.`,
    url: `${BASE_URL}/newsletter`,
    type: 'website',
  },
}

const BENEFITS = [
  'Resumen semanal de las noticias más relevantes del mundo de la IA',
  'Actualizaciones cuando publicamos nuevos rankings o los revisamos',
  'Comparativas exclusivas antes de publicarlas en la web',
  'Alertas de cambios de precio en las herramientas que seguimos',
  'Guías prácticas y recomendaciones adaptadas a casos de uso reales',
]

export default function NewsletterPage() {
  return (
    <>
      <Navigation />

      <main className="py-12 md:py-20">
        <div className="container-editorial">
          {/* Signup centered */}
          <div className="flex justify-center mb-16">
            <div className="w-full max-w-lg">
              <NewsletterSignup variant="hero" />
            </div>
          </div>

          {/* Qué recibirás */}
          <section className="mb-12">
            <h2 className="font-heading text-xl font-bold mb-6 text-center">
              Qué recibirás cada semana
            </h2>
            <ul className="flex flex-col gap-3 max-w-lg mx-auto">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-confidence-verified flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground leading-relaxed">{benefit}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Frecuencia y privacidad */}
          <div className="max-w-lg mx-auto rounded-xl border border-border bg-muted/30 p-5 text-center">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enviamos <strong className="text-foreground">un correo semanal</strong>, normalmente
              los lunes. Nunca compartimos tu dirección con terceros y puedes darte de baja
              en cualquier momento con un solo clic.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
