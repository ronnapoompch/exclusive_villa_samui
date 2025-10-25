import { NextResponse } from 'next/server'

export async function GET() {
  // Simple session check - can be extended later
  return NextResponse.json({ 
    session: null,
    message: 'Session endpoint - ready for implementation' 
  })
}

export async function POST() {
  return NextResponse.json({ 
    message: 'Session POST not supported' 
  }, { status: 405 })
}
