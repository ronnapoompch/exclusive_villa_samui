import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

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
    // Match admin routes only
    '/admin/:path*'
  ]
}