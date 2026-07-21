import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminSession } from '@/lib/auth'
import {
  LayoutDashboard,
  Inbox,
  FileText,
  Cpu,
  BarChart2,
  Rss,
  LogOut,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/cola', label: 'Cola editorial', icon: Inbox },
  { href: '/admin/articulos', label: 'Artículos', icon: FileText },
  { href: '/admin/modelos', label: 'Modelos', icon: Cpu },
  { href: '/admin/puntuaciones', label: 'Puntuaciones', icon: BarChart2 },
  { href: '/admin/fuentes', label: 'Fuentes', icon: Rss },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAdminSession()
  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-border bg-card flex flex-col">
        {/* Brand */}
        <div className="h-14 flex items-center px-4 border-b border-border">
          <span className="font-heading font-bold text-sm text-foreground">
            ComparaIA Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5" aria-label="Administración">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => (
            <AdminNavLink key={href} href={href} label={label} icon={Icon} exact={exact} />
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-3">
          <div className="text-xs text-muted-foreground px-2 mb-2 truncate">
            {session.email}
          </div>
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  )
}

// We need a client component for the active state, but to keep layout as Server Component
// we pass the href and let the browser handle it via CSS :where or use a simple approach.
// Using a simple link; active state can be handled by a thin client wrapper.
function AdminNavLink({
  href,
  label,
  icon: Icon,
}: {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors group"
    >
      <Icon className="h-4 w-4 flex-shrink-0 group-hover:text-primary transition-colors" aria-hidden="true" />
      {label}
    </Link>
  )
}
