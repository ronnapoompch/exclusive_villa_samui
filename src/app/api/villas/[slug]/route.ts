// Villa Detail API - Database with Local Images
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Villa slug is required',
        },
        { status: 400 }
      );
    }

    console.log(`🔍 Looking for villa with slug: ${slug}`);

    // Get villa with images from database
    const villa = await prisma.villa.findUnique({
      where: { slug },
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
        },
        reviews: {
          take: 10,
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            user: {
              select: {
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!villa) {
      return NextResponse.json(
        {
          success: false,
          error: 'Villa not found',
        },
        { status: 404 }
      );
    }

    // Group images by category
    const imageCategories: Record<string, string[]> = {};
    villa.villaImages.forEach(img => {
      if (!imageCategories[img.category]) {
        imageCategories[img.category] = [];
      }
      imageCategories[img.category].push(img.url);
    });

    // Get all images in order
    const allImages = villa.villaImages.map(img => img.url);

    // Calculate price
    const latestPricing = villa.pricing[0];
    const pricePerNight = latestPricing ? Number(latestPricing.dailyRate) : 0;

    // Calculate average rating
    const avgRating = villa.reviews.length > 0
      ? villa.reviews.reduce((sum, review) => sum + review.rating, 0) / villa.reviews.length
      : 0;

    // Format reviews
    const formattedReviews = villa.reviews.map(review => ({
      id: review.id,
      guestName: review.user?.name || 'Anonymous',
      rating: review.rating,
      comment: review.comment,
      title: review.title || '',
      createdAt: review.createdAt.toISOString()
    }));

    const villaData = {
      id: villa.id,
      name: villa.name,
      slug: villa.slug,
      description: villa.description,
      bedrooms: villa.bedrooms,
      bathrooms: villa.bathrooms,
      maxGuests: villa.maxGuests,
      beachfront: villa.beachfront,
      location: villa.location,
      locationLink: villa.locationLink,
      phone: villa.phone,
      officialWebsite: villa.officialWebsite,
      airbnbUrl: villa.airbnbUrl,
      agodaUrl: villa.agodaUrl,
      images: allImages,
      imageCategories: imageCategories,
      amenities: villa.amenities || [],
      minimumStay: villa.minimumStay,
      petFriendly: villa.petFriendly,
      featured: villa.featured,
      pricing: latestPricing ? {
        dailyRate: (latestPricing.dailyRate || 0).toString(),
        weeklyRate: latestPricing.weeklyRate?.toString(),
        monthlyRate: latestPricing.monthlyRate?.toString(),
        currency: latestPricing.currency
      } : null,
      pricePerNight: pricePerNight,
      reviews: formattedReviews,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: villa.reviews.length,
      imageCount: villa.villaImages.length,
      dataSource: 'database-local-images'
    };

    console.log(`✅ Found villa: ${villa.name} with ${villa.villaImages.length} images`);

    return NextResponse.json({
      success: true,
      data: villaData,
      message: 'Using local images from database'
    });

  } catch (error) {
    console.error('Villa Details API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch villa details',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}