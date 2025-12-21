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
        pricing: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
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

      // Calculate price from pricing table if available
      const latestPricing = villa.pricing[0];
      let pricePerNight = 0;
      if (latestPricing) {
        pricePerNight = Number(latestPricing.dailyRate || 0);
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
          currency: latestPricing?.currency || 'THB'
        },
        pricePerNight: pricePerNight,
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