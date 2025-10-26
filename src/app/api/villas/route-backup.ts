// src/app/api/villas/route.ts - Villa search and listing API
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample fallback data following coding-standards.md interface patterns
const SAMPLE_VILLAS = [
  {
    id: '1',
    name: 'Luxury Beachfront Villa Sunset',
    slug: 'luxury-beachfront-villa-sunset',
    description: 'Experience the ultimate luxury in this stunning beachfront villa with direct access to pristine white sand beaches. Features panoramic ocean views, infinity pool, and world-class amenities.',
    bedrooms: 4,
    bathrooms: 4,
    maxGuests: 8,
    beachfront: true,
    location: 'Chaweng Beach, Koh Samui',
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=800&fit=crop'
    ],
    amenities: ['Private Pool', 'Beach Access', 'WiFi', 'Air Conditioning', 'Kitchen', 'Sea View'],
    featured: true,
    active: true,
    pricing: [{
      dailyRate: '15000',
      weeklyRate: '98000',
      monthlyRate: '390000',
      currency: 'THB'
    }]
  },
  {
    id: '2',
    name: 'Modern Hillside Villa Paradise',
    slug: 'modern-hillside-villa-paradise',
    description: 'Perched on a hillside with breathtaking panoramic views, this modern villa offers luxury accommodation with contemporary design and premium amenities.',
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 6,
    beachfront: false,
    location: 'Choeng Mon, Koh Samui',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop'
    ],
    amenities: ['Private Pool', 'Mountain View', 'WiFi', 'Air Conditioning', 'Kitchen', 'Parking'],
    featured: true,
    active: true,
    pricing: [{
      dailyRate: '12000',
      weeklyRate: '78000',
      monthlyRate: '310000',
      currency: 'THB'
    }]
  },
  {
    id: '3',
    name: 'Traditional Thai Villa Garden',
    slug: 'traditional-thai-villa-garden',
    description: 'Experience authentic Thai hospitality in this beautifully designed traditional villa surrounded by lush tropical gardens.',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    beachfront: false,
    location: 'Bophut, Koh Samui',
    images: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&h=800&fit=crop'
    ],
    amenities: ['Garden View', 'Traditional Design', 'WiFi', 'Air Conditioning', 'Kitchen'],
    featured: false,
    active: true,
    pricing: [{
      dailyRate: '8500',
      weeklyRate: '55000',
      monthlyRate: '220000',
      currency: 'THB'
    }]
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract search parameters
    const location = searchParams.get('location');
    const bedrooms = searchParams.get('bedrooms');
    const beachfront = searchParams.get('beachfront');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {
      active: true,
    };

    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    if (bedrooms) {
      where.bedrooms = parseInt(bedrooms);
    }

    if (beachfront === 'true') {
      where.beachfront = true;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    // Price filtering (using current month's pricing)
    const currentMonth = new Date().getMonth() + 1;
    let priceFilter = {};
    if (minPrice || maxPrice) {
      priceFilter = {
        some: {
          month: currentMonth,
          ...(minPrice && { dailyRate: { gte: BigInt(minPrice) } }),
          ...(maxPrice && { dailyRate: { lte: BigInt(maxPrice) } }),
        },
      };
    }

    // Execute query
    const [villas, totalCount] = await Promise.all([
      prisma.villa.findMany({
        where: {
          ...where,
          ...(Object.keys(priceFilter).length > 0 && { pricing: priceFilter }),
        },
        include: {
          pricing: {
            where: { month: currentMonth },
            take: 1,
          },
        },
        orderBy: [
          { featured: 'desc' },
          { beachfront: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.villa.count({
        where: {
          ...where,
          ...(Object.keys(priceFilter).length > 0 && { pricing: priceFilter }),
        },
      }),
    ]);

    // Handle empty database results with sample data fallback
    if (villas.length === 0) {
      console.warn('📝 No villas in database, using sample data for demo');
      
      // Filter sample data based on search parameters
      let filteredSampleVillas = SAMPLE_VILLAS;
      
      if (location && location !== 'All Locations') {
        filteredSampleVillas = filteredSampleVillas.filter(villa => 
          villa.location.toLowerCase().includes(location.toLowerCase())
        );
      }
      
      if (bedrooms) {
        filteredSampleVillas = filteredSampleVillas.filter(villa => 
          villa.bedrooms >= parseInt(bedrooms)
        );
      }
      
      if (beachfront === 'true') {
        filteredSampleVillas = filteredSampleVillas.filter(villa => 
          villa.beachfront === true
        );
      }
      
      if (featured === 'true') {
        filteredSampleVillas = filteredSampleVillas.filter(villa => 
          villa.featured === true
        );
      }

      // Apply pagination to sample data
      const startIndex = offset;
      const endIndex = offset + limit;
      const paginatedSampleVillas = filteredSampleVillas.slice(startIndex, endIndex);
      
      // Format sample data and return early
      const formattedSampleVillas = paginatedSampleVillas.map(villa => ({
        id: villa.id,
        name: villa.name,
        slug: villa.slug,
        description: villa.description,
        bedrooms: villa.bedrooms,
        bathrooms: villa.bathrooms,
        maxGuests: villa.maxGuests,
        beachfront: villa.beachfront,
        location: villa.location,
        images: villa.images,
        amenities: villa.amenities,
        featured: villa.featured,
        pricing: villa.pricing[0] || null,
      }));

      return NextResponse.json({
        success: true,
        data: {
          villas: formattedSampleVillas,
          pagination: {
            total: filteredSampleVillas.length,
            limit,
            offset,
            hasMore: offset + limit < filteredSampleVillas.length,
          },
        },
      });
    }

    // Format database response data
    const formattedVillas = villas.map(villa => ({
      id: villa.id,
      name: villa.name,
      slug: villa.slug,
      description: villa.description,
      bedrooms: villa.bedrooms,
      bathrooms: villa.bathrooms,
      maxGuests: villa.maxGuests,
      beachfront: villa.beachfront,
      location: villa.location,
      images: villa.images,
      amenities: villa.amenities,
      featured: villa.featured,
      pricing: villa.pricing.map(p => ({
        dailyRate: p.dailyRate?.toString(),
        weeklyRate: p.weeklyRate?.toString(),
        monthlyRate: p.monthlyRate?.toString(),
        currency: p.currency,
      }))[0] || null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        villas: formattedVillas,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
      },
    });

  } catch (error) {
    console.error('Villa API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch villas',
      },
      { status: 500 }
    );
  }
}