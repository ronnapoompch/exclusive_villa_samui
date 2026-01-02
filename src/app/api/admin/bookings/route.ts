import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { validateOrigin, getCorsHeaders } from '@/lib/cors'; // Phase 1.6
import { adminRateLimit, getIdentifier, checkRateLimit } from '@/lib/rate-limit'; // Phase 1.7
// Phase 1.6: Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin)
  });
}

export async function GET(request: NextRequest) {
  // Phase 1.6: CORS validation
  const originError = validateOrigin(request);
  if (originError) return originError;

  // Phase 1.7: Rate limiting (20 requests per minute)
  const identifier = getIdentifier(request);
  const rateLimitError = await checkRateLimit(adminRateLimit, identifier);
  if (rateLimitError) return rateLimitError;

  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch all bookings with related data
    const bookings = await prisma.booking.findMany({
      include: {
        villa: {
          select: {
            name: true,
            slug: true
          }
        },
        payments: {
          select: {
            status: true,
            transactionId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Convert BigInt to Number for JSON serialization
    const serializedBookings = bookings.map(booking => ({
      ...booking,
      totalAmount: typeof booking.totalAmount === 'bigint' 
        ? Number(booking.totalAmount) 
        : booking.totalAmount
    }))

    return NextResponse.json({
      success: true,
      data: serializedBookings
    })

  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
