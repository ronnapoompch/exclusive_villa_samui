import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

/**
 * Calculate pricing for villa booking
 * POST /api/villas/[slug]/pricing
 * 
 * Body: { 
 *   checkIn: "2025-12-20", 
 *   checkOut: "2025-12-25",
 *   guests: 4 
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    const body = await request.json();
    const { checkIn, checkOut, guests } = body;

    // Validate inputs
    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'checkIn and checkOut dates are required' },
        { status: 400 }
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validate dates
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: 'checkOut must be after checkIn' },
        { status: 400 }
      );
    }

    // Calculate nights
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Find villa
    const villa = await prisma.villa.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        maxGuests: true,
        minimumStay: true,
        priceRates: {
          where: {
            active: true,
            // Find overlapping price periods
            startDate: { lte: checkOutDate },
            endDate: { gte: checkInDate }
          },
          orderBy: {
            startDate: 'asc'
          }
        }
      }
    });

    if (!villa) {
      return NextResponse.json(
        { error: 'Villa not found' },
        { status: 404 }
      );
    }

    // Check guest limit
    if (guests && villa.maxGuests && guests > villa.maxGuests) {
      return NextResponse.json(
        { 
          error: `Maximum ${villa.maxGuests} guests allowed`,
          maxGuests: villa.maxGuests
        },
        { status: 400 }
      );
    }

    // Calculate pricing
    if (villa.priceRates.length === 0) {
      return NextResponse.json(
        { 
          error: 'Pricing not available for selected dates',
          message: 'Please contact us for pricing information'
        },
        { status: 404 }
      );
    }

    // Build daily price breakdown
    const breakdown: Array<{
      date: string;
      price: number;
      seasonName?: string;
      source: string;
    }> = [];

    let currentDate = new Date(checkInDate);
    let totalNightPrice = 0;

    while (currentDate < checkOutDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Find price rate for this date
      const rate = villa.priceRates.find(r => {
        const rateStart = new Date(r.startDate);
        const rateEnd = new Date(r.endDate);
        return currentDate >= rateStart && currentDate < rateEnd;
      });

      if (rate) {
        breakdown.push({
          date: dateStr,
          price: rate.pricePerNight,
          seasonName: rate.seasonName || undefined,
          source: rate.source
        });
        totalNightPrice += rate.pricePerNight;
      } else {
        // No rate found for this date
        return NextResponse.json(
          { 
            error: `No pricing available for ${dateStr}`,
            message: 'Please contact us for pricing'
          },
          { status: 404 }
        );
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate average price per night
    const avgPricePerNight = Math.round(totalNightPrice / nights);

    // Additional fees (can be customized)
    const cleaningFee = nights >= 7 ? 5000 : 3000; // THB
    const serviceFee = Math.round(totalNightPrice * 0.05); // 5% service fee

    const total = totalNightPrice + cleaningFee + serviceFee;

    // Check minimum stay
    let minStayRequired = null;
    if (villa.minimumStay) {
      const minStayMatch = villa.minimumStay.match(/(\d+)/);
      if (minStayMatch) {
        minStayRequired = parseInt(minStayMatch[0]);
      }
    }

    // Get min/max stay from price rates
    const minStayFromRates = Math.max(
      ...villa.priceRates.map(r => r.minStay || 0)
    );
    const maxStayFromRates = villa.priceRates.some(r => r.maxStay)
      ? Math.min(...villa.priceRates.filter(r => r.maxStay).map(r => r.maxStay!))
      : null;

    const effectiveMinStay = Math.max(minStayRequired || 0, minStayFromRates);

    return NextResponse.json({
      success: true,
      villa: {
        id: villa.id,
        name: villa.name,
        slug: villa.slug,
        maxGuests: villa.maxGuests
      },
      checkIn: checkIn,
      checkOut: checkOut,
      nights,
      guests: guests || null,
      pricing: {
        pricePerNight: avgPricePerNight,
        totalNights: totalNightPrice,
        cleaningFee,
        serviceFee,
        subtotal: totalNightPrice + cleaningFee,
        total,
        currency: 'THB',
        breakdown
      },
      requirements: {
        minStay: effectiveMinStay > 0 ? effectiveMinStay : null,
        maxStay: maxStayFromRates,
        maxGuests: villa.maxGuests
      },
      warnings: effectiveMinStay > nights ? [
        `Minimum ${effectiveMinStay} night(s) required`
      ] : []
    });

  } catch (error) {
    console.error('Pricing calculation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to calculate pricing',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/villas/[slug]/pricing
 * Get price range and basic pricing info
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    const villa = await prisma.villa.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        maxGuests: true,
        minimumStay: true,
        priceRates: {
          where: { active: true },
          select: {
            pricePerNight: true,
            seasonName: true,
            minStay: true,
            maxStay: true,
            source: true
          }
        }
      }
    });

    if (!villa) {
      return NextResponse.json(
        { error: 'Villa not found' },
        { status: 404 }
      );
    }

    if (villa.priceRates.length === 0) {
      return NextResponse.json({
        success: true,
        villa: {
          id: villa.id,
          name: villa.name,
          slug: villa.slug
        },
        pricing: {
          available: false,
          message: 'Please contact us for pricing'
        }
      });
    }

    // Calculate price range
    const prices = villa.priceRates.map(r => r.pricePerNight);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return NextResponse.json({
      success: true,
      villa: {
        id: villa.id,
        name: villa.name,
        slug: villa.slug,
        maxGuests: villa.maxGuests
      },
      pricing: {
        available: true,
        minPricePerNight: minPrice,
        maxPricePerNight: maxPrice,
        currency: 'THB',
        seasons: villa.priceRates
          .filter(r => r.seasonName)
          .map(r => ({
            name: r.seasonName,
            pricePerNight: r.pricePerNight,
            minStay: r.minStay,
            maxStay: r.maxStay
          }))
      },
      requirements: {
        minStay: villa.minimumStay,
        maxGuests: villa.maxGuests
      }
    });

  } catch (error) {
    console.error('Get pricing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get pricing',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
