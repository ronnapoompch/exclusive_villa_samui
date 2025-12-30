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

      return NextResponse.json({
        success: true,
        data: villa,
      });
    }

    // Handle villa list with filters
    const result = await villaService.searchVillas(filters, limit, offset);

    return NextResponse.json({
      success: true,
      data: {
        villas: result.villas,
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
