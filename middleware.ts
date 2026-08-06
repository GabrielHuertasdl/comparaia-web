import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminJWT } from '@/lib/auth'
import { hasValidCronSecret } from '@/lib/cron-secret'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    const session = await verifyAdminJWT(token)
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  if (pathname.startsWith('/api/editorial') || pathname.startsWith('/api/scores')) {
    // Scheduled Vercel cron invocations carry no session cookie. Let them
    // through on a valid CRON_SECRET; the route handler authorises again.
    if (hasValidCronSecret(request.headers.get('authorization'))) {
      return NextResponse.next()
    }

    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const session = await verifyAdminJWT(token)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/editorial/:path*', '/api/scores/:path*'],
}
