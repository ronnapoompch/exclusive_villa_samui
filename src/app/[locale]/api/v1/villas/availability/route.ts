import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { validateRequest } from '@/lib/api/validate'
import { z } from 'zod'

// Availability check schema
const availabilitySchema = z.object({
  villaId: z.string().cuid(),
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime(),
  guests: z.number().min(1).max(50).optional(),
})

/**
 * POST /api/v1/villas/availability
 * Check villa availability for specific dates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = await validateRequest(availabilitySchema, body)
    
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

    const { villaId, checkIn, checkOut, guests } = validation.data!

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

    // Check if villa exists and is active
    const villa = await prisma.villa.findUnique({
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
      return NextResponse.json(
        { 
          success: false,
          error: { message: 'Villa not found or not available' }
        },
        { status: 404 }
      )
    }

    // Check guest capacity
    if (guests && guests > villa.maxGuests) {
      return NextResponse.json({
        success: true,
        data: {
          available: false,
          reason: 'GUEST_CAPACITY_EXCEEDED',
          message: `This villa can accommodate maximum ${villa.maxGuests} guests`,
          villa: {
            id: villa.id,
            name: villa.name,
            maxGuests: villa.maxGuests,
          }
        }
      })
    }

    // Check minimum stay requirement
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    if (villa.minimumStay && nights < Number(villa.minimumStay)) {
      return NextResponse.json({
        success: true,
        data: {
          available: false,
          reason: 'MINIMUM_STAY_NOT_MET',
          message: `Minimum stay is ${villa.minimumStay} nights`,
          villa: {
            id: villa.id,
            name: villa.name,
            minimumStay: villa.minimumStay,
          },
          requestedNights: nights,
        }
      })
    }

    // Check for conflicting bookings
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        villaId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            checkIn: { lte: checkOutDate },
            checkOut: { gte: checkInDate }
          }
        ]
      },
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
        status: true,
      },
      orderBy: { checkIn: 'asc' }
    })

    if (conflictingBookings.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          available: false,
          reason: 'BOOKING_CONFLICT',
          message: 'Villa is not available for the selected dates',
          villa: {
            id: villa.id,
            name: villa.name,
          },
          conflictingBookings: conflictingBookings.map(booking => ({
            checkIn: booking.checkIn.toISOString(),
            checkOut: booking.checkOut.toISOString(),
            status: booking.status,
          })),
        }
      })
    }

    // Calculate pricing
    const pricing = villa.pricing[0]
    const basePrice = pricing?.dailyRate ? Number(pricing.dailyRate) : 0
    const totalNights = nights
    const subtotal = basePrice * totalNights

    // Calculate additional fees (can be made configurable)
    const cleaningFee = Math.max(basePrice * 0.1, 500) // 10% or minimum 500 THB
    const serviceFee = subtotal * 0.05 // 5% service fee
    const taxAmount = (subtotal + serviceFee) * 0.07 // 7% VAT

    const total = subtotal + cleaningFee + serviceFee + taxAmount

    return NextResponse.json({
      success: true,
      data: {
        available: true,
        villa: {
          id: villa.id,
          name: villa.name,
          maxGuests: villa.maxGuests,
        },
        dateRange: {
          checkIn: checkInDate.toISOString(),
          checkOut: checkOutDate.toISOString(),
          nights: totalNights,
        },
        pricing: {
          currency: 'THB',
          nightlyRate: basePrice,
          subtotal,
          cleaningFee: Math.round(cleaningFee),
          serviceFee: Math.round(serviceFee),
          taxAmount: Math.round(taxAmount),
          total: Math.round(total),
          breakdown: {
            baseAmount: `${basePrice} × ${totalNights} nights = ${subtotal.toLocaleString()} THB`,
            cleaningFee: `${Math.round(cleaningFee).toLocaleString()} THB`,
            serviceFee: `5% service fee = ${Math.round(serviceFee).toLocaleString()} THB`,
            tax: `7% VAT = ${Math.round(taxAmount).toLocaleString()} THB`,
            total: `${Math.round(total).toLocaleString()} THB`,
          }
        },
        requirements: {
          minimumStay: villa.minimumStay || 1,
          maxGuests: villa.maxGuests,
        }
      }
    })

  } catch (error) {
    console.error('Availability check error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: { message: 'Internal server error during availability check' }
      },
      { status: 500 }
    )
  }
}