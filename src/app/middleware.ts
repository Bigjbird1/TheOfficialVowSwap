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
    const isSellerRoute = pathname.startsWith('/seller') || 
                         pathname.startsWith('/api/seller');

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
    // Only SELLER role for seller routes (or ADMIN for oversight)
    else if (isSellerRoute && !['SELLER', 'ADMIN'].includes(token?.role || '')) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    // If user is a seller and trying to access main dashboard (but not already trying to access seller dashboard), redirect to seller dashboard
    else if (pathname === '/dashboard' && token?.role === 'SELLER' && !pathname.startsWith('/seller')) {
      return NextResponse.redirect(new URL('/seller/dashboard', req.url));
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
    '/seller/:path*',
    '/api/admin/:path*',
    '/api/seller/:path*'
  ],
};
