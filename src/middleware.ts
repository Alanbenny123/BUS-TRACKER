import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const isAuth = !!req.nextauth.token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                      req.nextUrl.pathname.startsWith('/register') ||
                      req.nextUrl.pathname.startsWith('/forgot-password') ||
                      req.nextUrl.pathname.startsWith('/reset-password');

    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return null;
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                         req.nextUrl.pathname.startsWith('/register') ||
                         req.nextUrl.pathname.startsWith('/forgot-password') ||
                         req.nextUrl.pathname.startsWith('/reset-password');
                         
        const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard');
        
        if (isProtectedRoute) {
          return !!token;
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password'
  ]
}; 