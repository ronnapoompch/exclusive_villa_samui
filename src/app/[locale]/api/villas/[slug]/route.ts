// Villa Slug API with Folder-Based Names (Direct from Image Folders)
import { NextRequest, NextResponse } from 'next/server';
// Import villa data directly (Vercel-compatible)
import folderBasedVillasData from '../../../../../data/folder-based-villas.json';

// Load folder-based villa data (Vercel-compatible)
function loadFolderBasedVillas() {
  try {
    return folderBasedVillasData;
  } catch (error) {
    console.error('❌ Error loading folder-based villas:', error);
  }
  return null;
}

// Sample villa data for fallback (matching main API data)
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
        guestName: 'Sarah Johnson',
        rating: 5,
        title: 'Perfect beachfront getaway',
        comment: 'Absolutely stunning villa with incredible ocean views. The infinity pool was perfect and the beach access made this trip unforgettable.',
        createdAt: '2024-01-15T10:00:00Z'
      }
    ]
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
    }],
    reviews: [
      {
        id: '2',
        guestName: 'Michael Chen',
        rating: 5,
        title: 'Amazing views and modern amenities',
        comment: 'The hillside location provides incredible panoramic views. Modern design with all the amenities you could want.',
        createdAt: '2024-01-10T14:30:00Z'
      }
    ]
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
    }],
    reviews: [
      {
        id: '3',
        guestName: 'Emma Thompson',
        rating: 4,
        title: 'Authentic Thai experience',
        comment: 'Beautiful traditional design surrounded by gorgeous gardens. A peaceful retreat with authentic Thai charm.',
        createdAt: '2024-01-05T09:15:00Z'
      }
    ]
  }
];

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

    // Load folder-based villas (using folder names as villa names)
    const folderBasedData = loadFolderBasedVillas() as Record<string, any>;
    if (folderBasedData && folderBasedData[slug]) {
      const villa = folderBasedData[slug];
      
      // รวมรูปภาพทั้งหมดจากหมวดหมู่ต่างๆ เป็น array เดียว
      const allImages: string[] = [];
      const imageCategories = villa.images || {};
      
      // เรียงลำดับหมวดหมู่รูป: hero, ext, liv, din, kit, bed1, bed2-5, bath1, bath2-5, pool, view, amen
      const categoryOrder = ['hero', 'ext', 'liv', 'din', 'kit', 'bed1', 'bed2-5', 'bath1', 'bath2-5', 'pool', 'view', 'amen'];
      
      categoryOrder.forEach(category => {
        if (imageCategories[category] && Array.isArray(imageCategories[category])) {
          allImages.push(...imageCategories[category]);
        }
      });
      
      // สร้างข้อมูลวิลล่าที่มี images เป็น array
      const villaWithImages = {
        ...villa,
        images: allImages, // รูปภาพทั้งหมดรวมเป็น array
        imageCategories: imageCategories, // เก็บหมวดหมู่รูปไว้ใช้แยกดูได้
      };
      
      console.log(`✅ Found folder-based villa: ${villa.name} with ${allImages.length} images from folder`);
      
      return NextResponse.json({
        success: true,
        data: villaWithImages,
        message: 'Using real villa images from folder'
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
        ? sampleVilla.reviews.reduce((sum, review) => sum + review.rating, 0) / sampleVilla.reviews.length
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