// Villa Slug API with Folder-Based Names (Direct from Image Folders)
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Load folder-based villa data
function loadFolderBasedVillas() {
  try {
    const filePath = path.join(process.cwd(), 'src/data/folder-based-villas.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('❌ Error loading folder-based villas:', error);
  }
  return null;
}

// Sample villa data for fallback
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
    }],
    reviews: [
      {
        id: '1',
        rating: 5,
        comment: 'Absolutely stunning villa! Perfect for our family vacation.',
        guestName: 'Sarah Johnson',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
];

interface RouteParams {
  params: { slug: string }
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Villa slug is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Looking for villa with slug: ${slug}`);

    // Load folder-based villas (using folder names as villa names)
    const folderBasedData = loadFolderBasedVillas();
    if (folderBasedData && folderBasedData[slug]) {
      const villa = folderBasedData[slug];
      
      console.log(`✅ Found folder-based villa: ${villa.name} with ${villa.totalImages} images from folder`);
      
      return NextResponse.json({
        success: true,
        data: villa,
        message: 'Using villa name directly from image folder'
      });
    }

    // If no folder-based villa found, try sample data
    console.warn(`📝 Villa '${slug}' not found in folder-based data, checking sample data`);
    
    const sampleVilla = SAMPLE_VILLAS.find(v => v.slug === slug);
    
    if (!sampleVilla) {
      return NextResponse.json(
        {
          success: false,
          error: 'Villa not found',
        },
        { status: 404 }
      );
    }

    // Return formatted sample villa data
    const formattedSampleVilla = {
      id: sampleVilla.id,
      name: sampleVilla.name,
      slug: sampleVilla.slug,
      description: sampleVilla.description,
      bedrooms: sampleVilla.bedrooms,
      bathrooms: sampleVilla.bathrooms,
      maxGuests: sampleVilla.maxGuests,
      beachfront: sampleVilla.beachfront,
      location: sampleVilla.location,
      images: sampleVilla.images,
      amenities: sampleVilla.amenities,
      featured: sampleVilla.featured,
      pricing: sampleVilla.pricing,
      reviews: sampleVilla.reviews,
      avgRating: sampleVilla.reviews.length > 0 
        ? sampleVilla.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / sampleVilla.reviews.length
        : 0,
      reviewCount: sampleVilla.reviews.length,
      dataSource: 'sample-fallback'
    };

    return NextResponse.json({
      success: true,
      data: formattedSampleVilla,
    });

  } catch (error) {
    console.error('Villa Details API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch villa details',
      },
      { status: 500 }
    );
  }
}