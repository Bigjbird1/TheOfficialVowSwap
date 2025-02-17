import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedPaths = [
    '/dashboard',
    '/orders',
    '/seller',
    '/messages',
    '/liked-items',
    '/registry'
  ]

  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !session) {
    // Redirect to login if accessing protected route without session
    const redirectUrl = new URL('/auth/signin', request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Auth page redirects
  if (session && (
    request.nextUrl.pathname.startsWith('/auth/signin') ||
    request.nextUrl.pathname.startsWith('/auth/signup')
  )) {
    // Redirect to dashboard if already logged in
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return res
}

// Specify which routes should trigger this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}
