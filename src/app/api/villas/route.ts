// Villa API - Database with Local Images
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // API parameters
    const featuredOnly = searchParams.get('featured') === 'true';
    const beachfront = searchParams.get('beachfront') === 'true';
    const location = searchParams.get('location');
    const bedrooms = searchParams.get('bedrooms');
    const guests = searchParams.get('guests');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {
      active: true
    };

    if (featuredOnly) {
      where.featured = true;
    }
    
    if (beachfront) {
      where.beachfront = true;
    }
    
    if (location && location !== 'All Locations') {
      where.location = {
        contains: location,
        mode: 'insensitive'
      };
    }
    
    if (bedrooms) {
      where.bedrooms = { gte: parseInt(bedrooms) };
    }
    
    if (guests) {
      where.maxGuests = { gte: parseInt(guests) };
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count
    const total = await prisma.villa.count({ where });

    // Get current month/year for pricing
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    // Get villas with images
    const villas = await prisma.villa.findMany({
      where,
      include: {
        villaImages: {
          orderBy: [
            { isHero: 'desc' },
            { order: 'asc' }
          ]
        },
        pricing: true // Get all pricing records
      },
      skip: offset,
      take: limit,
      orderBy: [
        { featured: 'desc' },
        { name: 'asc' }
      ]
    });

    // Transform villas for response
    const transformedVillas = villas.map(villa => {
      // Group images by category
      const images = villa.villaImages.map(img => img.url);
      const heroImage = villa.villaImages.find(img => img.isHero)?.url || images[0];

      // Find current month pricing (December 2025)
      const currentPricing = villa.pricing.find(
        p => p.month === currentMonth && p.year === currentYear
      );

      // Fallback to latest pricing if current month not available
      const latestPricing = currentPricing || villa.pricing[0];

      let pricePerNight = 0;
      let weeklyRate = 0;
      let monthlyRate = 0;
      let isMonthlyRate = false;
      let allMonthlyRates = undefined;

      if (latestPricing) {
        pricePerNight = Number(latestPricing.dailyRate || 0);
        weeklyRate = Number(latestPricing.weeklyRate || 0);
        monthlyRate = Number(latestPricing.monthlyRate || 0);
        
        // If monthly rate is available, get all 12 months for display
        if (monthlyRate > 0) {
          // Get all 12 months pricing for villas with monthly rates
          const monthlyPricing = villa.pricing
            .filter(p => p.year === currentYear && p.monthlyRate && Number(p.monthlyRate) > 0)
            .sort((a, b) => a.month - b.month)
            .map(p => ({
              month: p.month,
              rate: Number(p.monthlyRate)
            }));
          
          if (monthlyPricing.length > 0) {
            allMonthlyRates = monthlyPricing;
          }
          
          // If only monthly rate available (no daily rate), mark as monthly-only
          if (pricePerNight === 0) {
            isMonthlyRate = true;
            pricePerNight = monthlyRate; // Use monthly as primary price
          }
        }
      }

      return {
        id: villa.id,
        slug: villa.slug,
        name: villa.name,
        description: villa.description,
        bedrooms: villa.bedrooms,
        bathrooms: villa.bathrooms,
        maxGuests: villa.maxGuests,
        beachfront: villa.beachfront,
        location: villa.location,
        images: images,
        heroImage: heroImage,
        amenities: villa.amenities || [],
        featured: villa.featured,
        pricing: {
          dailyRate: latestPricing?.dailyRate?.toString() || '0',
          weeklyRate: latestPricing?.weeklyRate?.toString() || '0',
          monthlyRate: latestPricing?.monthlyRate?.toString() || '0',
          currency: latestPricing?.currency || 'THB',
          month: latestPricing?.month || currentMonth,
          year: latestPricing?.year || currentYear
        },
        pricePerNight: pricePerNight,
        weeklyRate: weeklyRate > 0 ? weeklyRate : undefined,
        monthlyRate: monthlyRate > 0 ? monthlyRate : undefined,
        isMonthlyRate: isMonthlyRate,
        allMonthlyRates: allMonthlyRates,
        imageCount: villa.villaImages.length
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        villas: transformedVillas,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
          totalPages: Math.ceil(total / limit),
          currentPage: Math.floor(offset / limit) + 1
        }
      },
      stats: {
        totalVillas: total,
        dataSource: 'database-local-images',
        message: 'Using local images from database'
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    console.error('❌ Villa API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch villas',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}