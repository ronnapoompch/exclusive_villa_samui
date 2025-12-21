import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Temporarily disabled middleware to debug redirect loop
export function middleware(request: NextRequest) {
  return NextResponse.next()
}