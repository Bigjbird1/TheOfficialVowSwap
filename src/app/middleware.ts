import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    
    // Check admin routes
    const isAdminRoute = pathname.startsWith('/admin');
    const isModerationRoute = pathname.startsWith('/admin/moderation') || 
                             pathname.startsWith('/api/admin/moderation');

    // Allow both ADMIN and MODERATOR roles for moderation routes
    if (isModerationRoute) {
      if (!['ADMIN', 'MODERATOR'].includes(token?.role || '')) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
    // Only ADMIN role for other admin routes
    else if (isAdminRoute && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/api/admin/:path*',
  ],
};
