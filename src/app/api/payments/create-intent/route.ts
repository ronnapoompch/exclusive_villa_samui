import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe/server';
import prisma from '@/lib/db/prisma';
import { z } from 'zod';
import { differenceInDays, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';
import { validateOrigin, getCorsHeaders } from '@/lib/cors'; // Phase 1.6
import { paymentRateLimit, getIdentifier, checkRateLimit } from '@/lib/rate-limit'; // Phase 1.7
import { logger } from '@/lib/logger'; // Phase 1.12

/**
 * POST /api/payments/create-intent
 * 
 * Creates a Stripe PaymentIntent for villa booking
 * Flow: Client → Create Intent → Get clientSecret → Confirm Payment
 * 
 * ⚠️ CRITICAL: Must re-validate availability and recalculate pricing server-side
 */

const createIntentSchema = z.object({
  villaId: z.string().min(1, 'Villa ID is required'),
  villaName: z.string().optional(), // Optional, will be fetched from DB
  checkInDate: z.string().datetime('Invalid check-in date'),
  checkOutDate: z.string().datetime('Invalid check-out date'),
  nights: z.number().int().positive().optional(), // Optional, will be recalculated
  guests: z.number().int().min(1, 'At least 1 guest required'),
  guestName: z.string().min(2, 'Guest name is required'),
  guestEmail: z.string().email('Valid email is required'),
  guestPhone: z.string().optional(),
  specialRequests: z.string().optional(),
  baseTotal: z.number().positive().optional(), // Client calculation
  discountAmount: z.number().optional(), // Client calculation
  discountLabel: z.string().optional(), // Client calculation
  serviceFee: z.number().optional(), // Client calculation
  taxes: z.number().optional(), // Client calculation
  totalPrice: z.number().positive().optional(), // Client calculation (will be validated)
  totalAmount: z.number().positive().optional(), // Legacy support
});

// Phase 1.6: Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin)
  });
}

export async function POST(request: NextRequest) {
  // Phase 1.6: CORS validation
  const originError = validateOrigin(request);
  if (originError) return originError;

  // Phase 1.7: Rate limiting (10 requests per 10 seconds)
  const identifier = getIdentifier(request);
  const rateLimitError = await checkRateLimit(paymentRateLimit, identifier);
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();
    
    // Validate request data
    const validationResult = createIntentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validationResult.error.errors[0].message,
            details: validationResult.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Parse dates
    const checkIn = parseISO(data.checkInDate);
    const checkOut = parseISO(data.checkOutDate);
    const today = startOfDay(new Date());

    // Validate dates
    if (isBefore(checkIn, today)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Check-in date cannot be in the past',
          },
        },
        { status: 400 }
      );
    }

    if (!isAfter(checkOut, checkIn)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Check-out date must be after check-in date',
          },
        },
        { status: 400 }
      );
    }

    const nights = differenceInDays(checkOut, checkIn);

    if (nights < 2) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Minimum stay is 3 days (2 nights)',
          },
        },
        { status: 400 }
      );
    }

    // Fetch villa details with pricing
    const villa = await prisma.villa.findUnique({
      where: { id: data.villaId },
      select: {
        id: true,
        name: true,
        active: true,
        isMonthlyRate: true,
        pricing: {
          orderBy: { month: 'asc' },
        },
      },
    });

    if (!villa) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Villa not found',
          },
        },
        { status: 404 }
      );
    }

    if (!villa.active) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Villa is not available for booking',
          },
        },
        { status: 400 }
      );
    }

    // Get current month pricing
    const currentMonth = checkIn.getMonth() + 1; // JavaScript months are 0-indexed
    const currentYear = checkIn.getFullYear();
    
    const currentPricing = villa.pricing.find(
      p => p.month === currentMonth && p.year === currentYear
    ) || villa.pricing[0]; // Fallback to first available pricing

    if (!currentPricing || !currentPricing.dailyRate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Pricing not available for this villa',
          },
        },
        { status: 400 }
      );
    }

    // Check availability - find overlapping bookings
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        villaId: data.villaId,
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
      select: { id: true },
    });

    if (overlappingBookings.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAVAILABLE',
            message: 'Selected dates are not available. Please choose different dates.',
          },
        },
        { status: 409 }
      );
    }

    // Recalculate pricing server-side (NEVER trust client)
    // Convert BigInt to Number for calculations
    const basePriceNumber = typeof currentPricing.dailyRate === 'bigint' 
      ? Number(currentPricing.dailyRate) 
      : currentPricing.dailyRate;
    
    let effectiveRate = basePriceNumber;
    let discountLabel = null;

    // Apply discounts based on duration
    if (nights >= 30) {
      effectiveRate = basePriceNumber * 0.7; // 30% off monthly
      discountLabel = '30% monthly discount';
    } else if (nights >= 7) {
      effectiveRate = basePriceNumber * 0.85; // 15% off weekly
      discountLabel = '15% weekly discount';
    }

    const baseTotal = nights * basePriceNumber;
    const discountedTotal = nights * effectiveRate;
    const discountAmount = baseTotal - discountedTotal;
    const serviceFee = Math.round(discountedTotal * 0.05); // 5% service fee
    const taxes = Math.round((discountedTotal + serviceFee) * 0.07); // 7% VAT
    const totalPrice = discountedTotal + serviceFee + taxes;

    // Validate client's amount matches server calculation (tolerance: 1 THB for rounding)
    // Support both totalAmount (legacy) and totalPrice (new)
    const clientAmount = data.totalPrice || data.totalAmount || totalPrice;
    const priceDifference = Math.abs(clientAmount - totalPrice);
    
    if (priceDifference > 1) {
      console.error('Price mismatch:', {
        client: clientAmount,
        server: totalPrice,
        difference: priceDifference,
        breakdown: {
          nights,
          basePricePerNight: basePriceNumber,
          effectiveRate,
          baseTotal,
          discountedTotal,
          discountAmount,
          serviceFee,
          taxes,
        },
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Price calculation mismatch. Please refresh and try again.',
          },
        },
        { status: 400 }
      );
    }

    // Convert THB to satang (smallest currency unit for Stripe)
    const amountInSatang = Math.round(totalPrice * 100);

    // Validate amount within Stripe limits
    if (amountInSatang < STRIPE_CONFIG.minAmount) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Amount too small. Minimum is ${STRIPE_CONFIG.minAmount / 100} THB`,
          },
        },
        { status: 400 }
      );
    }

    if (amountInSatang > STRIPE_CONFIG.maxAmount) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Amount too large. Maximum is ${STRIPE_CONFIG.maxAmount / 100} THB`,
          },
        },
        { status: 400 }
      );
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSatang,
      currency: STRIPE_CONFIG.currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        villaId: data.villaId,
        villaName: villa.name,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        nights: nights.toString(),
        guests: data.guests.toString(),
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone || '',
        specialRequests: data.specialRequests || '',
        baseTotal: baseTotal.toString(),
        discountAmount: discountAmount.toString(),
        discountLabel: discountLabel || '',
        serviceFee: serviceFee.toString(),
        taxes: taxes.toString(),
        totalPrice: totalPrice.toString(),
      },
      description: `Booking: ${villa.name} (${nights} nights)`,
      receipt_email: data.guestEmail,
    });

    logger.payment('PaymentIntent created', { 
      paymentIntentId: paymentIntent.id,
      villaId: data.villaId,
      amount: totalPrice,
      currency: 'thb'
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          amount: amountInSatang,
          currency: STRIPE_CONFIG.currency,
          villaName: villa.name,
          nights,
          totalPrice,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Error creating PaymentIntent:', error);

    // Handle Stripe errors
    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'STRIPE_ERROR',
            message: error.message,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create payment intent. Please try again.',
        },
      },
      { status: 500 }
    );
  }
}
