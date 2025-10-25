import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { validateRequest, getClientIP, getUserAgent } from '@/lib/api/validate'
import { auditLog } from '@/lib/audit/audit-log'
import { z } from 'zod'

// Create booking schema
const createBookingSchema = z.object({
  villaId: z.string().cuid(),
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime(),
  guests: z.number().min(1).max(50),
  guestName: z.string().min(2).max(100),
  guestEmail: z.string().email(),
  guestPhone: z.string().optional(),
  specialRequests: z.string().max(1000).optional(),
})

/**
 * POST /api/v1/bookings
 * Create a new villa booking
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add proper authentication when auth is implemented
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    // }
    
    // Get request body
    const body = await request.json()
    const validation = await validateRequest(createBookingSchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false,
          error: { 
            message: 'Validation failed',
            details: validation.error?.issues
          }
        },
        { status: 400 }
      )
    }

    const {
      villaId,
      checkIn,
      checkOut,
      guests,
      guestName,
      guestEmail,
      guestPhone,
      specialRequests
    } = validation.data!

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    // Validate date range
    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { 
          success: false,
          error: { message: 'Check-out date must be after check-in date' }
        },
        { status: 400 }
      )
    }

    // Check if check-in is in the future
    if (checkInDate <= new Date()) {
      return NextResponse.json(
        { 
          success: false,
          error: { message: 'Check-in date must be in the future' }
        },
        { status: 400 }
      )
    }

    // Use database transaction for booking creation
    const booking = await prisma.$transaction(async (tx) => {
      // Check villa exists and is active
      const villa = await tx.villa.findUnique({
        where: { id: villaId, active: true },
        select: {
          id: true,
          name: true,
          maxGuests: true,
          minimumStay: true,
          pricing: {
            where: { currency: 'THB' },
            take: 1,
            orderBy: { month: 'asc' }
          }
        }
      })

      if (!villa) {
        throw new Error('Villa not found or not available')
      }

      // Check guest capacity
      if (guests > villa.maxGuests) {
        throw new Error(`This villa can accommodate maximum ${villa.maxGuests} guests`)
      }

      // Check minimum stay
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
      if (villa.minimumStay && nights < Number(villa.minimumStay)) {
        throw new Error(`Minimum stay is ${villa.minimumStay} nights`)
      }

      // Check for conflicting bookings
      const conflictingBooking = await tx.booking.findFirst({
        where: {
          villaId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          OR: [
            {
              checkIn: { lte: checkOutDate },
              checkOut: { gte: checkInDate }
            }
          ]
        }
      })

      if (conflictingBooking) {
        throw new Error('Villa is not available for the selected dates')
      }

      // Calculate pricing
      const pricing = villa.pricing[0]
      const basePrice = pricing?.dailyRate ? Number(pricing.dailyRate) : 0
      const totalNights = nights
      const subtotal = basePrice * totalNights

      // Calculate fees
      const cleaningFee = Math.max(basePrice * 0.1, 500) // 10% or minimum 500 THB
      const serviceFee = subtotal * 0.05 // 5% service fee
      const taxAmount = (subtotal + serviceFee) * 0.07 // 7% VAT

      const totalAmount = subtotal + cleaningFee + serviceFee + taxAmount

      // Create booking
      const newBooking = await tx.booking.create({
        data: {
          villaId,
          userId: null, // TODO: Add proper auth
          guestName,
          guestEmail,
          guestPhone,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guests,
          totalAmount,
          currency: 'THB',
          status: 'PENDING',
          paymentStatus: 'PENDING',
          specialRequests,
        },
        include: {
          villa: {
            select: {
              name: true,
              location: true,
              images: true,
            }
          }
        }
      })

      return newBooking
    })

    // Audit log (simplified without IP for now)
    await auditLog({
      action: 'booking.created',
      entityType: 'BOOKING',
      entityId: booking.id,
      userId: undefined, // TODO: Add proper auth
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      metadata: {
        villaId,
        guestEmail,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        guests,
        totalAmount: booking.totalAmount.toString(),
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        booking: {
          id: booking.id,
          villaId: booking.villaId,
          villaName: booking.villa.name,
          checkIn: booking.checkIn.toISOString(),
          checkOut: booking.checkOut.toISOString(),
          guests: booking.guests,
          totalAmount: booking.totalAmount.toString(),
          currency: booking.currency,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          createdAt: booking.createdAt.toISOString(),
        },
        nextSteps: {
          paymentRequired: true,
          paymentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          paymentUrl: `/bookings/${booking.id}/payment`,
        }
      },
    })

  } catch (error) {
    console.error('Booking creation error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    
    return NextResponse.json(
      { 
        success: false,
        error: { message: errorMessage }
      },
      { status: error instanceof Error && error.message.includes('not available') ? 409 : 500 }
    )
  }
}

/**
 * GET /api/v1/bookings
 * Get bookings (simplified version)
 */
export async function GET(request: NextRequest) {
  try {
    // For now, return all bookings - TODO: Add proper auth and filtering
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    
    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {
      ...(status && { status })
    }

    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          villa: {
            select: {
              name: true,
              location: true,
              images: true,
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.booking.count({ where }),
    ])

    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      villa: {
        id: booking.villaId,
        name: booking.villa.name,
        location: booking.villa.location,
        images: booking.villa.images,
      },
      checkIn: booking.checkIn.toISOString(),
      checkOut: booking.checkOut.toISOString(),
      guests: booking.guests,
      totalAmount: booking.totalAmount.toString(),
      currency: booking.currency,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      specialRequests: booking.specialRequests,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      payments: booking.payments,
    }))

    return NextResponse.json({
      success: true,
      data: {
        bookings: formattedBookings,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: page * limit < totalCount,
        }
      },
    })

  } catch (error) {
    console.error('Get bookings error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: { message: 'Internal server error' }
      },
      { status: 500 }
    )
  }
}