import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import prisma from '@/lib/db/prisma'
import { z } from 'zod'

/**
 * 💳 STRIPE PAYMENT CONFIRMATION API
 * Confirms payment intent and updates booking status
 * 
 * POST /api/payments/confirm
 * Security: Payment intent validation, database consistency
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Payment confirmation schema
const confirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, 'Payment Intent ID is required'),
  paymentMethodId: z.string().optional(),
  bookingId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validation = confirmPaymentSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }

    const { paymentIntentId, bookingId } = validation.data

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (!paymentIntent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment intent not found'
        },
        { status: 404 }
      )
    }

    // Extract booking ID from metadata or request
    const extractedBookingId = bookingId || paymentIntent.metadata?.bookingId

    if (!extractedBookingId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking ID not found in payment intent'
        },
        { status: 400 }
      )
    }

    // Find the payment record in database
    const payment = await prisma.payment.findFirst({
      where: {
        paymentIntentId: paymentIntentId,
        bookingId: extractedBookingId
      },
      include: {
        booking: {
          include: {
            villa: {
              select: {
                name: true,
                slug: true
              }
            },
            user: {
              select: {
                email: true,
                name: true
              }
            }
          }
        }
      }
    })

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment record not found'
        },
        { status: 404 }
      )
    }

    // Check payment intent status
    let updatedPaymentStatus: 'PENDING' | 'PAID' | 'FAILED' = 'PENDING'
    let updatedBookingStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' = 'PENDING'

    switch (paymentIntent.status) {
      case 'succeeded':
        updatedPaymentStatus = 'PAID'
        updatedBookingStatus = 'CONFIRMED'
        break
      case 'canceled':
        updatedPaymentStatus = 'FAILED'
        updatedBookingStatus = 'CANCELLED'
        break
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
      case 'processing':
        updatedPaymentStatus = 'PENDING'
        updatedBookingStatus = 'PENDING'
        break
      default:
        updatedPaymentStatus = 'PENDING'
    }

    // Update payment and booking in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update payment record
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: updatedPaymentStatus,
          processedAt: paymentIntent.status === 'succeeded' ? new Date() : null,
          transactionId: (typeof paymentIntent.latest_charge === 'string' ? paymentIntent.latest_charge : paymentIntent.id)
        }
      })

      // Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id: extractedBookingId },
        data: {
          paymentStatus: updatedPaymentStatus,
          status: updatedBookingStatus
        }
      })

      return { payment: updatedPayment, booking: updatedBooking }
    })

    // Return success response with updated information
    return NextResponse.json({
      success: true,
      data: {
        paymentIntentId: paymentIntent.id,
        paymentStatus: updatedPaymentStatus,
        bookingStatus: updatedBookingStatus,
        amount: paymentIntent.amount / 100, // Convert back from cents
        currency: paymentIntent.currency,
        booking: {
          id: payment.booking.id,
          villaName: payment.booking.villa.name,
          checkIn: payment.booking.checkIn,
          checkOut: payment.booking.checkOut,
          guests: payment.booking.guests,
          totalAmount: payment.booking.totalAmount
        },
        payment: {
          id: result.payment.id,
          amount: result.payment.amount,
          currency: result.payment.currency,
          status: result.payment.status,
          processedAt: result.payment.processedAt
        }
      },
      message: updatedPaymentStatus === 'PAID' 
        ? 'Payment successful! Your booking is confirmed.' 
        : updatedPaymentStatus === 'FAILED'
        ? 'Payment failed. Please try again.'
        : 'Payment is being processed.'
    })

  } catch (error: any) {
    console.error('Payment Confirmation Error:', error)
    
    // Handle Stripe specific errors
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid payment confirmation request',
          details: error.message
        },
        { status: 400 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: 'Database constraint violation',
          details: 'Duplicate payment confirmation'
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Payment confirmation failed',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check payment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentIntentId = searchParams.get('payment_intent')
    const bookingId = searchParams.get('booking_id')

    if (!paymentIntentId && !bookingId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment Intent ID or Booking ID is required'
        },
        { status: 400 }
      )
    }

    let payment
    if (paymentIntentId) {
      payment = await prisma.payment.findFirst({
        where: { paymentIntentId },
        include: {
          booking: {
            include: {
              villa: { select: { name: true, slug: true } }
            }
          }
        }
      })
    } else if (bookingId) {
      payment = await prisma.payment.findFirst({
        where: { bookingId },
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            include: {
              villa: { select: { name: true, slug: true } }
            }
          }
        }
      })
    }

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment not found'
        },
        { status: 404 }
      )
    }

    // Also get latest status from Stripe
    let stripeStatus = null
    if (payment.paymentIntentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(payment.paymentIntentId)
        stripeStatus = paymentIntent.status
      } catch (error) {
        console.warn('Could not retrieve Stripe payment intent:', error)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        payment: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          paymentIntentId: payment.paymentIntentId,
          processedAt: payment.processedAt,
          createdAt: payment.createdAt
        },
        booking: {
          id: payment.booking.id,
          status: payment.booking.status,
          paymentStatus: payment.booking.paymentStatus,
          villaName: payment.booking.villa.name
        },
        stripeStatus
      }
    })

  } catch (error: any) {
    console.error('Payment Status Check Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check payment status',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
