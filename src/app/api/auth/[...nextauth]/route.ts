import { NextRequest, NextResponse } from 'next/server';

// Redirect NextAuth requests to locale-prefixed route
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace('/api/auth', '/en/api/auth');
  const newUrl = `${url.origin}${pathname}${url.search}`;
  
  return NextResponse.redirect(newUrl);
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace('/api/auth', '/en/api/auth');
  const newUrl = `${url.origin}${pathname}${url.search}`;
  
  return NextResponse.redirect(newUrl, { status: 307 });
}
