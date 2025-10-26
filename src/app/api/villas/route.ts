// Villa API - Optimized with Cloudinary Images  
import { NextRequest, NextResponse } from 'next/server';

// Dynamically import villa data (Vercel bundles this during build)
const getVillasData = async () => {
  const data = await import('../../../../public/villas-data.json');
  return data.default || data;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Load villas data via dynamic import
    const allVillas: any[] = await getVillasData();
    console.log(`✅ Using ${allVillas.length} optimized villas with Cloudinary images`);
    
    // API parameters
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

    // Filter villas based on search parameters
    let filteredVillas = allVillas;

    if (featuredOnly) {
      filteredVillas = filteredVillas.filter((villa: any) => villa.featured);
    }
    
    if (beachfront) {
      filteredVillas = filteredVillas.filter((villa: any) => villa.features?.beachfront);
    }
    
    if (location && location !== 'All Locations') {
      filteredVillas = filteredVillas.filter((villa: any) => 
        villa.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    if (bedrooms) {
      filteredVillas = filteredVillas.filter((villa: any) => villa.bedrooms >= parseInt(bedrooms));
    }
    
    if (guests) {
      filteredVillas = filteredVillas.filter((villa: any) => villa.guests >= parseInt(guests));
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredVillas = filteredVillas.filter((villa: any) =>
        villa.name.toLowerCase().includes(searchLower) ||
        villa.description.toLowerCase().includes(searchLower) ||
        villa.location.toLowerCase().includes(searchLower)
      );
    }
    
    if (minPrice || maxPrice) {
      filteredVillas = filteredVillas.filter((villa: any) => {
        // Get the price to compare - use min from range if available, otherwise use pricePerNight
        let villaPrice = villa.pricePerNight;
        
        // If villa has priceRange, use the minimum price from the range
        if (villa.priceRange?.min) {
          villaPrice = villa.priceRange.min;
        }
        
        if (!villaPrice || villaPrice === 0) return true; // Include villas without price info
        
        // Apply min/max filters
        if (minPrice && villaPrice < parseInt(minPrice)) return false;
        if (maxPrice && villaPrice > parseInt(maxPrice)) return false;
        
        return true;
      });
    }

    const total = filteredVillas.length;
    
    // Apply pagination
    const paginatedVillas = filteredVillas.slice(offset, offset + limit);

    // Transform villas for API response
    const transformedVillas = paginatedVillas.map((villa: any) => {
      // Combine all images into images array for VillaCard
      const allImages: string[] = [];
      
      // Image categories from villas-optimized.json
      const imageCategories = ['hero', 'ext', 'liv', 'din', 'kit', 'bed1', 'bed2-5', 'bath1', 'bath2-5', 'pool', 'view', 'amen'];
      
      imageCategories.forEach(category => {
        if (villa[category] && Array.isArray(villa[category])) {
          allImages.push(...villa[category]);
        }
      });
      
      return {
        id: villa.id?.toString() || villa.codeId,
        slug: villa.slug,
        name: villa.name,
        description: villa.description,
        bedrooms: villa.bedrooms,
        bathrooms: villa.bathrooms,
        maxGuests: villa.guests,
        beachfront: villa.features?.beachfront || false,
        location: villa.location,
        images: allImages.length > 0 ? allImages : (villa.gallery || [villa.image]),
        amenities: villa.amenities || [],
        featured: villa.featured || false,
        pricing: {
          dailyRate: villa.pricePerNight?.toString() || '0',
          currency: 'THB'
        },
        pricePerNight: villa.pricePerNight || 0,
        priceRange: villa.priceRange,
        isMonthlyRate: villa.isMonthlyRate || false,
        weeklyRate: villa.weeklyRate,
        monthlyRate: villa.monthlyRate
      };
    });

    // Sort by featured first, then by name
    const sortedVillas = transformedVillas.sort((a: any, b: any) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.name.localeCompare(b.name);
    });

    const response = {
      success: true,
      data: {
        villas: sortedVillas,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
          totalPages: Math.ceil(total / limit),
          currentPage: Math.floor(offset / limit) + 1
        }
      },
      optimizedStats: {
        totalVillas: allVillas.length,
        totalImages: allVillas.reduce((sum: number, villa: any) => sum + (villa.gallery?.length || 0), 0),
        averageImagesPerVilla: Math.round(allVillas.reduce((sum: number, villa: any) => sum + (villa.gallery?.length || 0), 0) / allVillas.length),
        dataSource: 'villas-optimized-cloudinary',
        message: 'Using optimized villa data with Cloudinary CDN'
      }
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