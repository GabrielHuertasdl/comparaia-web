import { NextResponse } from 'next/server'
import { ingestAllSources } from '@/lib/editorial/ingestor'
import { authorizeCronOrAdmin } from '@/lib/cron'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

async function handle(request: Request) {
  const caller = await authorizeCronOrAdmin(request)
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const results = await ingestAllSources()
    const totalQueued = results.reduce((sum, r) => sum + r.queued, 0)
    const totalFetched = results.reduce((sum, r) => sum + r.fetched, 0)

    await db.auditLog.create({
      data: {
        userId: caller.userId,
        action: 'UPDATE',
        entityType: 'Ingest',
        entityId: caller.kind === 'cron' ? 'scheduled' : 'manual',
        after: { totalFetched, totalQueued, sources: results.length },
      },
    })

    return NextResponse.json({ data: { results, totalQueued, totalFetched } })
  } catch (error) {
    console.error('[Ingest] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ingest failed' },
      { status: 500 }
    )
  }
}

/** Vercel cron invokes scheduled paths with GET. */
export async function GET(request: Request) {
  return handle(request)
}

/** Manual trigger from the admin UI. */
export async function POST(request: Request) {
  return handle(request)
}
