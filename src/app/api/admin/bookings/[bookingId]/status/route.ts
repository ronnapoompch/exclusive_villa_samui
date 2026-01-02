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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
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

    const { bookingId } = await context.params
    const body = await request.json()
    const { status } = body

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        villa: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    // TODO: Send email notification to guest about status change
    // if (status === 'CONFIRMED') {
    //   await sendBookingConfirmedEmail(updatedBooking)
    // } else if (status === 'CANCELLED') {
    //   await sendBookingCancelledEmail(updatedBooking)
    // }

    return NextResponse.json({
      success: true,
      data: updatedBooking,
      message: `Booking status updated to ${status}`
    })

  } catch (error) {
    console.error('Error updating booking status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update booking status' },
      { status: 500 }
    )
  }
}
