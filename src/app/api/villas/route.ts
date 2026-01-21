// Villa API - Following Repository + Service Pattern from docs/claude-md.md
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { VillaRepository } from '@/lib/repositories/villa.repository';
import { VillaService } from '@/lib/services/villa.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Initialize service layer
const villaRepository = new VillaRepository(prisma);
const villaService = new VillaService(villaRepository);

// Helper function to convert BigInt to string for JSON serialization
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }
  
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = serializeBigInt(obj[key]);
    }
    return newObj;
  }
  
  return obj;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters = {
      location: searchParams.get('location') || undefined,
      bedrooms: searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined,
      guests: searchParams.get('guests') ? parseInt(searchParams.get('guests')!) : undefined,
      beachfront: searchParams.get('beachfront') === 'true' ? true : undefined,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      search: searchParams.get('search') || undefined,
      minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    };

    const limit = parseInt(searchParams.get('limit') || '1000');
    const offset = parseInt(searchParams.get('offset') || '0');
    const slug = searchParams.get('slug');

    // Handle single villa by slug
    if (slug) {
      const villa = await villaService.getVillaBySlug(slug);
      
      if (!villa) {
        return NextResponse.json(
          { success: false, error: 'Villa not found' },
          { status: 404 }
        );
      }

      // Transform villa images for frontend
      const heroImage = (villa as any).villaImages?.find((img: any) => img.isHero)?.url || (villa as any).villaImages?.[0]?.url;
      const images = (villa as any).villaImages
        ?.sort((a: any, b: any) => a.order - b.order)
        ?.map((img: any) => img.url) || [];

      // Serialize BigInt values before returning
      const serializedVilla = serializeBigInt({
        ...villa,
        images,
        heroImage,
      });

      return NextResponse.json({
        success: true,
        data: serializedVilla,
      });
    }

    // Handle villa list with filters
    const result = await villaService.searchVillas(filters, limit, offset);

    // Transform villas to include pricing info and images array
    const transformedVillas = result.villas.map((villa: any) => {
      // Extract hero image URL from villaImages relation
      const heroImage = villa.villaImages?.find((img: any) => img.isHero)?.url || villa.villaImages?.[0]?.url;
      
      // Create images array from villaImages relation, sorted by order
      const images = villa.villaImages
        ?.sort((a: any, b: any) => a.order - b.order)
        ?.map((img: any) => img.url) || [];

      // Check if this is a monthly-rate villa (text-based like "Monthly 120K-140K")
      if (villa.isMonthlyRate && villa.monthlyPriceText) {
        return serializeBigInt({
          ...villa,
          images, // Add images array for frontend
          heroImage, // Add hero image for card display
          isMonthlyRate: true,
          monthlyPriceText: villa.monthlyPriceText, // "Monthly 120K-140K"
          pricePerNight: null,
          pricing: undefined,
        });
      }
      
      // Daily rate villa
      const currentPricing = villa.pricing?.find((p: any) => {
        const now = new Date();
        return p.month === now.getMonth() + 1 && 
               (!p.year || p.year === now.getFullYear());
      }) || villa.pricing?.[0];

      return serializeBigInt({
        ...villa,
        images, // Add images array for frontend
        heroImage, // Add hero image for card display
        isMonthlyRate: false,
        pricePerNight: currentPricing?.dailyRate ? Number(currentPricing.dailyRate) : null,
        pricing: currentPricing ? {
          dailyRate: String(currentPricing.dailyRate),
          weeklyRate: currentPricing.weeklyRate ? String(currentPricing.weeklyRate) : undefined,
          monthlyRate: currentPricing.monthlyRate ? String(currentPricing.monthlyRate) : undefined,
          currency: currentPricing.currency || 'THB',
        } : undefined,
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        villas: transformedVillas,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.hasMore,
        },
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });

  } catch (error: any) {
    console.error('[Villa API Error]:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
