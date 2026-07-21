import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils/format'

export default async function AdminHerramientasPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const tools = await db.aITool.findMany({
    orderBy: { name: 'asc' },
    include: {
      model: { select: { name: true, developer: true } },
      affiliateLinks: { where: { active: true }, select: { id: true, partner: true, clickCount: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Herramientas</h1>
        <span className="text-sm text-muted-foreground">{tools.length} herramientas</span>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Nombre</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Modelo</th>
              <th className="text-left px-4 py-3 font-medium">Precio</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Afiliado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tools.map((tool) => (
              <tr key={tool.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <span className="font-medium">{tool.name}</span>
                    <p className="text-xs text-muted-foreground line-clamp-1">{tool.tagline}</p>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                  {tool.model ? `${tool.model.name} (${tool.model.developer})` : '—'}
                </td>
                <td className="px-4 py-3 text-xs">
                  {tool.hasFreeplan ? (
                    <span className="text-green-600 dark:text-green-400">Freemium</span>
                  ) : (
                    formatPrice(tool.startingPrice)
                  )}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-xs">
                  {tool.affiliateLinks.length > 0 ? (
                    <span className="text-purple-600 dark:text-purple-400">
                      {tool.affiliateLinks[0].partner} ({tool.affiliateLinks[0].clickCount} clicks)
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Sin afiliado</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/herramientas/${tool.slug}`}
                    target="_blank"
                    className="text-primary hover:underline text-xs"
                  >
                    Ver →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
