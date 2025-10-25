import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
// import createIntlMiddleware from 'next-intl/middleware'
// import {routing} from './src/i18n/routing'

// Simple locale handling for Next.js 15 compatibility
const supportedLocales = ['en', 'th', 'zh', 'ru'];
const defaultLocale = 'en';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Simple locale handling for non-admin routes
    if (!pathname.startsWith('/admin') && !pathname.startsWith('/api')) {
      // Check if pathname starts with a supported locale
      const segments = pathname.split('/');
      const maybeLocale = segments[1];
      
      if (!supportedLocales.includes(maybeLocale)) {
        // Redirect to default locale
        return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, req.url));
      }
      
      return NextResponse.next();
    }

    // Admin route protection
    if (pathname.startsWith('/admin')) {
      // Allow access to login page
      if (pathname === '/admin/login') {
        // If user is already authenticated and is admin, redirect to dashboard
        if (token && token.role === 'ADMIN') {
          return NextResponse.redirect(new URL('/admin/dashboard', req.url))
        }
        return NextResponse.next()
      }

      // For all other admin routes, check authentication and role
      if (!token) {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }

      if (token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/login?error=unauthorized', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Allow all non-admin routes
        if (!pathname.startsWith('/admin')) {
          return true
        }

        // Allow admin login page
        if (pathname === '/admin/login') {
          return true
        }

        // For admin routes, require authentication and ADMIN role
        return !!token && token.role === 'ADMIN'
      }
    }
  }
)

export const config = {
  matcher: [
    // Match internationalized pathnames  
    '/((?!api|_next/static|_next/image|favicon.ico|admin).*)',
    // Match admin routes
    '/admin/:path*'
  ]
}