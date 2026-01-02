import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

/**
 * GET /api/bookings/by-payment-intent/[paymentIntentId]
 * 
 * Get booking ID by PaymentIntent ID
 * Used after successful payment to redirect to confirmation page
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { paymentIntentId: string } }
) {
  try {
    const resolvedParams = await params;
    const { paymentIntentId } = resolvedParams;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'PaymentIntent ID is required' },
        { status: 400 }
      );
    }

    // Find payment by PaymentIntent ID
    const payment = await prisma.payment.findUnique({
      where: { paymentIntentId },
      select: {
        id: true,
        bookingId: true,
      },
    });

    if (!payment || !payment.bookingId) {
      return NextResponse.json(
        { error: 'Booking not found for this payment' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      bookingId: payment.bookingId,
    });

  } catch (error) {
    console.error('Error fetching booking by payment intent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
