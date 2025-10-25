// Enhanced Villa API with Real Image Integration
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Load processed villa images
let villaImageData: any = null;

function loadVillaImages() {
  if (!villaImageData) {
    try {
      const imagePath = path.join(process.cwd(), 'src/data/villa-images.json');
      if (fs.existsSync(imagePath)) {
        const data = fs.readFileSync(imagePath, 'utf8');
        villaImageData = JSON.parse(data);
        console.log(`✅ Loaded ${villaImageData.villas.length} villas with ${villaImageData.metadata.totalImages} images`);
      }
    } catch (error) {
      console.error('❌ Failed to load villa images:', error);
    }
  }
  return villaImageData;
}

// Enhanced villa data with real images
function enhanceVillaWithImages(villa: any) {
  const imageData = loadVillaImages();
  if (!imageData) return villa;

  // Find matching villa by name or slug
  const matchingVilla = imageData.villas.find((v: any) => 
    v.slug === villa.slug || 
    v.name.toLowerCase() === villa.name.toLowerCase() ||
    villa.name.toLowerCase().includes(v.name.toLowerCase().substring(0, 10))
  );

  if (matchingVilla) {
    // Extract all images in proper order
    const allImages: string[] = [];
    const imageCategories: any = {};

    // Sort categories by order and collect images
    if (matchingVilla.sortedCategories) {
      matchingVilla.sortedCategories.forEach((category: any) => {
        imageCategories[category.type] = category.images.map((img: any) => img.url);
        category.images.forEach((img: any) => {
          allImages.push(img.url);
        });
      });
    }

    // Enhanced villa object
    return {
      ...villa,
      images: allImages,
      imageCategories,
      heroImage: matchingVilla.heroImage?.url || allImages[0],
      totalImages: matchingVilla.totalImages,
      imageStats: {
        heroShots: imageCategories['Hero Shots']?.length || 0,
        exterior: imageCategories['Exterior']?.length || 0,
        livingRoom: imageCategories['Living Room']?.length || 0,
        bedrooms: (imageCategories['Master Bedroom']?.length || 0) + (imageCategories['Bedroom 2']?.length || 0),
        bathrooms: (imageCategories['Master Bathroom']?.length || 0) + (imageCategories['Bathroom 2']?.length || 0),
        pool: imageCategories['Pool Area']?.length || 0,
        views: imageCategories['Views']?.length || 0,
        amenities: imageCategories['Amenities']?.length || 0
      }
    };
  }

  return villa;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Load and log villa images on first request
    loadVillaImages();
    
    // Existing API parameters
    const featuredOnly = searchParams.get('featured') === 'true';
    const beachfront = searchParams.get('beachfront') === 'true';
    const location = searchParams.get('location');
    const bedrooms = searchParams.get('bedrooms');
    const guests = searchParams.get('guests');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build Prisma query
    const where: any = { active: true };
    
    if (featuredOnly) where.featured = true;
    if (beachfront) where.beachfront = true;
    if (location && location !== 'All Locations') {
      where.location = { contains: location, mode: 'insensitive' };
    }
    if (bedrooms) where.bedrooms = { gte: parseInt(bedrooms) };
    if (guests) where.maxGuests = { gte: parseInt(guests) };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Price filtering
    if (minPrice || maxPrice) {
      where.pricing = {
        some: {
          AND: [
            minPrice ? { dailyRate: { gte: minPrice } } : {},
            maxPrice ? { dailyRate: { lte: maxPrice } } : {}
          ]
        }
      };
    }

    // Get total count
    const total = await prisma.villa.count({ where });

    // Get villas with relations
    const villas = await prisma.villa.findMany({
      where,
      include: {
        pricing: true,
        reviews: {
          take: 3,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { reviews: true }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset
    });

    // Transform and enhance villas with real images
    const transformedVillas = villas.map(villa => {
      const baseVilla = {
        id: villa.id,
        name: villa.name,
        slug: villa.slug,
        description: villa.description,
        bedrooms: villa.bedrooms,
        bathrooms: villa.bathrooms,
        maxGuests: villa.maxGuests,
        beachfront: villa.beachfront,
        location: villa.location,
        amenities: Array.isArray(villa.amenities) ? villa.amenities : [],
        featured: villa.featured,
        pricePerNight: villa.pricing?.[0]?.dailyRate || null,
        pricing: villa.pricing?.[0] ? {
          dailyRate: villa.pricing[0].dailyRate,
          weeklyRate: villa.pricing[0].weeklyRate,
          monthlyRate: villa.pricing[0].monthlyRate,
          currency: villa.pricing[0].currency
        } : null,
        reviews: villa.reviews?.map(review => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          guestName: review.guestName,
          createdAt: review.createdAt.toISOString()
        })) || [],
        totalReviews: villa._count.reviews,
        averageRating: villa.reviews?.length > 0 
          ? villa.reviews.reduce((acc, review) => acc + review.rating, 0) / villa.reviews.length 
          : 0
      };

      // Enhance with real images
      return enhanceVillaWithImages(baseVilla);
    });

    const response = {
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
      imageStats: villaImageData ? {
        totalVillas: villaImageData.metadata.totalVillas,
        totalImages: villaImageData.metadata.totalImages,
        averageImagesPerVilla: Math.round(villaImageData.metadata.totalImages / villaImageData.metadata.totalVillas)
      } : null
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Villa API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch villas',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}