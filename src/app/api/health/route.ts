import { NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Count villas
    const villaCount = await prisma.villa.count()
    const imageCount = await prisma.villaImage.count()
    
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      data: {
        villas: villaCount,
        images: imageCount
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      error: String(error)
    }, { status: 500 })
  }
}
