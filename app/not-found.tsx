import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="text-6xl font-heading font-bold text-muted-foreground">404</p>
      <h1 className="text-2xl font-heading font-semibold">Página no encontrada</h1>
      <p className="text-muted-foreground max-w-sm">
        La página que buscas no existe o ha sido movida.
      </p>
      <Link
        href="/"
        className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
