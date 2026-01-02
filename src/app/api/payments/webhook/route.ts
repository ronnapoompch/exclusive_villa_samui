import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/server';
import prisma from '@/lib/db/prisma';
import { sendBookingConfirmation } from '@/services/email.service';
import { parseISO } from 'date-fns';
import { logger } from '@/lib/logger';

/**
 * POST /api/payments/webhook
 * 
 * Stripe Webhook Handler - SINGLE SOURCE OF TRUTH
 * 
 * ⚠️ CRITICAL RULES:
 * 1. Always verify webhook signature
 * 2. Use raw body (not parsed JSON)
 * 3. Booking is ONLY created here after successful payment
 * 4. Must be idempotent (handle duplicate events)
 * 5. Return 200 quickly (process async if needed)
 * 
 * Events handled:
 * - payment_intent.succeeded → Create booking + Send email
 * - payment_intent.failed → Log failure + Notify customer
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.text(); // ⚠️ Must use .text() for raw body
    const signature = headers().get('stripe-signature');

    if (!signature) {
      console.error('❌ Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    logger.info('Webhook verified', { type: event.type, eventId: event.id });

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        logger.info('Unhandled event type', { type: event.type });
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Webhook handler error:', error);
    // Still return 200 to prevent Stripe retries
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

/**
 * Handle successful payment
 * Creates booking and payment records, sends confirmation email
 * 
 * ⚠️ CRITICAL: Re-validates availability to prevent race conditions
 * Flow: Check idempotency → Re-check availability → Create booking → Refund if conflict
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const metadata = paymentIntent.metadata;

  logger.payment('Processing successful payment', { paymentIntentId: paymentIntent.id });

  try {
    // Check if booking already exists (idempotency)
    const existingPayment = await prisma.payment.findUnique({
      where: { paymentIntentId: paymentIntent.id },
      include: { booking: true },
    });

    if (existingPayment) {
      logger.info('Booking already exists for PaymentIntent', { paymentIntentId: paymentIntent.id });
      return; // Already processed, skip
    }

    // Parse dates from metadata
    const checkIn = parseISO(metadata.checkInDate);
    const checkOut = parseISO(metadata.checkOutDate);
    const nights = parseInt(metadata.nights);
    const guests = parseInt(metadata.guests);
    const totalPrice = parseFloat(metadata.totalPrice);

    // Create booking and payment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 🔴 CRITICAL: Re-check availability (prevents race conditions)
      const overlappingBookings = await tx.booking.findMany({
        where: {
          villaId: metadata.villaId,
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
          OR: [
            {
              // New booking starts during existing booking
              AND: [
                { checkIn: { lte: checkIn } },
                { checkOut: { gt: checkIn } },
              ],
            },
            {
              // New booking ends during existing booking
              AND: [
                { checkIn: { lt: checkOut } },
                { checkOut: { gte: checkOut } },
              ],
            },
            {
              // New booking completely contains existing booking
              AND: [
                { checkIn: { gte: checkIn } },
                { checkOut: { lte: checkOut } },
              ],
            },
          ],
        },
        select: { 
          id: true,
          checkIn: true,
          checkOut: true,
          guestName: true,
        },
      });

      if (overlappingBookings.length > 0) {
        // ⚠️ CONFLICT DETECTED - Villa is no longer available
        console.error('🔴 BOOKING CONFLICT:', {
          paymentIntentId: paymentIntent.id,
          villaId: metadata.villaId,
          requestedDates: { checkIn, checkOut },
          conflictsWith: overlappingBookings,
        });

        // Log conflict to database for tracking
        await tx.payment.create({
          data: {
            bookingId: null as any, // No booking created
            amount: totalPrice,
            currency: 'THB',
            status: 'REFUNDED',
            paymentIntentId: paymentIntent.id,
            transactionId: `conflict_${paymentIntent.id}`,
            paymentMethod: 'CONFLICT',
            processedAt: new Date(),
          },
        });

        // Initiate refund with Stripe
        try {
          const refund = await stripe.refunds.create({
            payment_intent: paymentIntent.id,
            reason: 'requested_by_customer',
            metadata: {
              reason: 'Villa no longer available (double booking prevented)',
              conflictCount: overlappingBookings.length.toString(),
            },
          });

          logger.payment('Refund initiated for duplicate payment', { refundId: refund.id, paymentIntentId: paymentIntent.id });
          
          // TODO: Send email notification to customer about conflict
          // sendBookingConflictNotification(metadata.guestEmail, ...)
        } catch (refundError: any) {
          console.error('❌ Refund failed:', refundError.message);
          // TODO: Alert admin - manual refund required
        }

        // Throw error to rollback transaction
        throw new Error('BOOKING_CONFLICT: Villa no longer available');
      }

      // Create booking
      const booking = await tx.booking.create({
        data: {
          villaId: metadata.villaId,
          checkIn,
          checkOut,
          guests,
          guestName: metadata.guestName,
          guestEmail: metadata.guestEmail,
          guestPhone: metadata.guestPhone || null,
          specialRequests: metadata.specialRequests || null,
          totalAmount: totalPrice,
          currency: 'THB',
          status: 'PENDING', // Admin will confirm later
          paymentStatus: 'PAID',
        },
      });

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: totalPrice,
          currency: 'THB',
          status: 'PAID',
          paymentIntentId: paymentIntent.id,
          transactionId: paymentIntent.id, // Using same ID for now
          processedAt: new Date(),
        },
      });

      // Fetch villa details for email
      const villa = await tx.villa.findUnique({
        where: { id: metadata.villaId },
        select: {
          name: true,
          slug: true,
          location: true,
          images: {
            take: 1,
            select: { url: true },
          },
        },
      });

      return { booking, payment, villa };
    });

      logger.info('Booking and payment created', { 
        bookingId: result.booking.id, 
        paymentId: result.payment.id,
        villaId: metadata.villaId,
        guestEmail: metadata.guestEmail
      });
    // ⚠️ Guard: Skip email if RESEND_API_KEY not configured
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_placeholder_for_build_only') {
      sendBookingConfirmation({
        guestName: metadata.guestName,
        guestEmail: metadata.guestEmail,
        villaName: metadata.villaName,
        villaImage: result.villa?.images[0]?.url || '',
        villaLocation: result.villa?.location || '',
        villaSlug: result.villa?.slug || '',
        bookingId: result.booking.id,
        checkInDate: metadata.checkInDate,
        checkOutDate: metadata.checkOutDate,
        nights,
        guests,
        baseTotal: parseFloat(metadata.baseTotal),
        discount: parseFloat(metadata.discountAmount),
        discountLabel: metadata.discountLabel,
        serviceFee: parseFloat(metadata.serviceFee),
        taxes: parseFloat(metadata.taxes),
        totalPrice,
        currency: 'THB',
        specialRequests: metadata.specialRequests,
      })
        .then((result) => {
          if (result.success) {
            logger.info('Confirmation email sent', { messageId: result.messageId, guestEmail: metadata.guestEmail });
          } else {
            logger.error('Failed to send confirmation email', { error: result.error });
          }
        })
        .catch((err) => {
          logger.error('Email sending error', { error: err });
        });
    } else {
      logger.info('Email sending skipped', { reason: 'RESEND_API_KEY not configured' });
    }
  } catch (error: any) {
    logger.error('Error processing successful payment', { error, paymentIntentId: paymentIntent.id });
    
    // If it's a booking conflict, the refund was already handled
    if (error.message?.includes('BOOKING_CONFLICT')) {
      logger.warn('Booking conflict handled with automatic refund', { paymentIntentId: paymentIntent.id });
      // TODO: Send conflict notification email to customer
      return; // Exit gracefully - conflict resolved
    }
    
    // Log to monitoring service (e.g., Sentry)
    throw error; // Will be caught by outer try-catch
  }
}

/**
 * Handle failed payment
 * Logs failure and optionally notifies customer
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  logger.error('Payment failed', { 
    paymentIntentId: paymentIntent.id,
    failureReason: paymentIntent.last_payment_error?.message
  });

  const metadata = paymentIntent.metadata;

  try {
    // Optional: Log failed payment to database for tracking
    await prisma.payment.create({
      data: {
        bookingId: '', // No booking created yet
        amount: paymentIntent.amount / 100, // Convert from satang
        currency: 'THB',
        status: 'FAILED',
        paymentIntentId: paymentIntent.id,
        transactionId: paymentIntent.id,
        processedAt: new Date(),
      },
    }).catch(() => {
      // Ignore error if booking doesn't exist (can't create payment without booking)
      logger.info('Could not log failed payment', { reason: 'no booking exists' });
    });

    // Optional: Send failure notification email
    // await sendPaymentFailedEmail({
    //   to: metadata.guestEmail,
    //   guestName: metadata.guestName,
    //   villaName: metadata.villaName,
    //   reason: paymentIntent.last_payment_error?.message,
    // });
  } catch (error: any) {
    console.error('❌ Error handling payment failure:', error);
  }
}
