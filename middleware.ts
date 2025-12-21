// Middleware completely disabled to prevent blocking routes
// NextAuth will only protect /admin routes via page-level checks

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Let all requests through
  return NextResponse.next()
}

// No routes are matched - middleware is effectively disabled
export const config = {
  matcher: []
}