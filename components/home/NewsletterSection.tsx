import { Mail } from 'lucide-react'
import NewsletterSignup from '@/components/shared/NewsletterSignup'

export default function NewsletterSection() {
  return (
    <section className="relative overflow-hidden py-24 border-t border-border/30 bg-background">
      <div className="absolute inset-0 bg-newsletter-glow pointer-events-none" aria-hidden />
      <div className="container-editorial relative z-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <Mail className="h-7 w-7 text-primary" />
        </div>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-balance mb-4">
          Recibe lo mejor de la IA cada semana
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8 text-balance">
          Rankings, comparativas y novedades en tu bandeja de entrada. Sin ruido, solo lo que importa.
        </p>
        <NewsletterSignup variant="inline" />
        <p className="text-xs text-muted-foreground mt-6">
          Sin spam · Baja cuando quieras
        </p>
      </div>
    </section>
  )
}
