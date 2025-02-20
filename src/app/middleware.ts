import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth({
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;
      
      // Require authentication for seller and account routes
      if (path.startsWith('/seller') || path.startsWith('/account')) {
        return !!token;
      }
      
      // Allow access to other routes
      return true;
    },
  },
});

// Specify which routes to protect
export const config = {
  matcher: [
    "/seller/:path*",
    "/account/:path*"
  ],
};
