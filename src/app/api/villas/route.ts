// Villa API - JSON File with Vercel Blob Images
import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Load JSON data from file system (runtime)
function getVillasData() {
  const filePath = join(process.cwd(), 'data', 'villas-vercel-blob.json');
  const fileContents = readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

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
    const slug = searchParams.get('slug');
    const limit = parseInt(searchParams.get('limit') || '1000');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Load villas data at runtime
    let villas = getVillasData() as any[];

    // Filter by slug (for single villa)
    if (slug) {
      const villa = villas.find(v => v.slug === slug);
      if (!villa) {
        return NextResponse.json(
          { error: 'Villa not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(villa);
    }

    // Filter by featured
    if (featuredOnly) {
      villas = villas.filter(v => v.featured === true);
    }

    // Filter by beachfront
    if (beachfront) {
      villas = villas.filter(v => v.beachfront === true);
    }

    // Filter by location
    if (location && location !== 'All Locations') {
      villas = villas.filter(v => 
        v.location?.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Filter by bedrooms
    if (bedrooms) {
      const bedroomsNum = parseInt(bedrooms);
      villas = villas.filter(v => v.bedrooms >= bedroomsNum);
    }

    // Filter by guests
    if (guests) {
      const guestsNum = parseInt(guests);
      villas = villas.filter(v => v.maxGuests >= guestsNum);
    }

    // Filter by search text
    if (search) {
      const searchLower = search.toLowerCase();
      villas = villas.filter(villa => 
        villa.name?.toLowerCase().includes(searchLower) ||
        villa.description?.toLowerCase().includes(searchLower) ||
        villa.location?.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const total = villas.length;
    const paginatedVillas = villas.slice(offset, offset + limit);

    return NextResponse.json(paginatedVillas, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'X-Total-Count': total.toString(),
      },
    });
  } catch (error) {
    console.error('Error in /api/villas:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}