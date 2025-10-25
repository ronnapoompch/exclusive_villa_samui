import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Load all villa images from the comprehensive JSON file
let ALL_VILLA_IMAGES: any = {};
try {
  const imagesPath = path.join(process.cwd(), 'src', 'data', 'all-villa-images.json');
  if (fs.existsSync(imagesPath)) {
    const imagesData = fs.readFileSync(imagesPath, 'utf8');
    ALL_VILLA_IMAGES = JSON.parse(imagesData);
  }
} catch (error) {
  console.error('Error loading all-villa-images.json:', error);
}

// Complete villa database with all 15 villas
const COMPLETE_VILLA_DATABASE = [
  {
    id: 'apollo-modern-villa',
    name: 'Villa Apollo Modern',
    slug: 'apollo-modern-villa',
    description: 'Contemporary hillside villa with breathtaking panoramic views and modern amenities.',
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 6,
    beachfront: false,
    location: 'Choeng Mon, Koh Samui',
    images: [getHeroImage('apollo')],
    amenities: ['Private Pool', 'Panoramic Views', 'Modern Design', 'WiFi', 'Air Conditioning'],
    featured: true,
    active: true,
    rating: 4.8,
    reviewCount: 23,
    pricing: {
      dailyRate: 12000,
      weeklyRate: 78000,
      monthlyRate: 310000,
      currency: 'THB'
    }
  },
  {
    id: 'poseidon-penthouse',
    name: 'Villa Poseidon Penthouse',
    slug: 'poseidon-penthouse',
    description: 'Luxury beachfront villa with panoramic ocean views and infinity pool.',
    bedrooms: 4,
    bathrooms: 4,
    maxGuests: 8,
    beachfront: true,
    location: 'Chaweng Beach, Koh Samui',
    images: [getHeroImage('poseidon')],
    amenities: ['Private Beach Access', 'Infinity Pool', 'Ocean Views', 'Butler Service'],
    featured: true,
    active: true,
    rating: 4.9,
    reviewCount: 45,
    pricing: {
      dailyRate: 25000,
      weeklyRate: 165000,
      monthlyRate: 650000,
      currency: 'THB'
    }
  },
  {
    id: 'artemis-garden-villa',
    name: 'Villa Artemis Garden',
    slug: 'artemis-garden-villa',
    description: 'Traditional Thai villa surrounded by lush tropical gardens.',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    beachfront: false,
    location: 'Bophut, Koh Samui',
    images: [getHeroImage('artemis')],
    amenities: ['Private Garden', 'Traditional Design', 'Pool', 'WiFi'],
    featured: false,
    active: true,
    rating: 4.6,
    reviewCount: 18,
    pricing: {
      dailyRate: 8000,
      weeklyRate: 52000,
      monthlyRate: 200000,
      currency: 'THB'
    }
  },
  {
    id: 'zeus-luxury-villa',
    name: 'Villa Zeus Luxury',
    slug: 'zeus-luxury-villa',
    description: 'Magnificent luxury villa with private beach access and world-class amenities.',
    bedrooms: 5,
    bathrooms: 5,
    maxGuests: 10,
    beachfront: true,
    location: 'Plai Laem, Koh Samui',
    images: [getHeroImage('zeus')],
    amenities: ['Private Beach', 'Infinity Pool', 'Butler Service', 'Spa Room', 'Chef Service'],
    featured: true,
    active: true,
    rating: 5.0,
    reviewCount: 67,
    pricing: {
      dailyRate: 35000,
      weeklyRate: 230000,
      monthlyRate: 900000,
      currency: 'THB'
    }
  },
  {
    id: 'hera-hillside-villa',
    name: 'Villa Hera Hillside',
    slug: 'hera-hillside-villa',
    description: 'Secluded hillside retreat with stunning sunset views and private infinity pool.',
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 6,
    beachfront: false,
    location: 'Mae Nam, Koh Samui',
    images: [getHeroImage('hera')],
    amenities: ['Sunset Views', 'Infinity Pool', 'Hillside Location', 'Privacy'],
    featured: true,
    active: true,
    rating: 4.7,
    reviewCount: 31,
    pricing: {
      dailyRate: 14000,
      weeklyRate: 91000,
      monthlyRate: 360000,
      currency: 'THB'
    }
  },
  {
    id: 'athena-beachfront-villa',
    name: 'Villa Athena Beachfront',
    slug: 'athena-beachfront-villa',
    description: 'Stunning beachfront villa with direct beach access and panoramic ocean views.',
    bedrooms: 4,
    bathrooms: 4,
    maxGuests: 8,
    beachfront: true,
    location: 'Bangrak Beach, Koh Samui',
    images: [getHeroImage('athena')],
    amenities: ['Direct Beach Access', 'Ocean Views', 'Private Pool', 'Beach Equipment'],
    featured: true,
    active: true,
    rating: 4.8,
    reviewCount: 39,
    pricing: {
      dailyRate: 18000,
      weeklyRate: 117000,
      monthlyRate: 460000,
      currency: 'THB'
    }
  },
  {
    id: 'ares-exclusive-villa',
    name: 'Villa Ares Exclusive',
    slug: 'ares-exclusive-villa',
    description: 'Exclusive luxury villa with premium amenities and stunning architecture.',
    bedrooms: 4,
    bathrooms: 4,
    maxGuests: 8,
    beachfront: true,
    location: 'Chaweng Noi, Koh Samui',
    images: [getHeroImage('ares')],
    amenities: ['Luxury Finishes', 'Beach Access', 'Private Pool', 'Premium Design'],
    featured: true,
    active: true,
    rating: 4.8,
    reviewCount: 25,
    pricing: {
      dailyRate: 20000,
      weeklyRate: 130000,
      monthlyRate: 520000,
      currency: 'THB'
    }
  },
  {
    id: 'hermes-modern-villa',
    name: 'Villa Hermes Modern',
    slug: 'hermes-modern-villa',
    description: 'Contemporary design villa with sleek architecture and luxury finishes.',
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 6,
    beachfront: false,
    location: 'Choeng Mon, Koh Samui',
    images: [getHeroImage('hermes')],
    amenities: ['Modern Design', 'Private Pool', 'City Views', 'Luxury Finishes'],
    featured: false,
    active: true,
    rating: 4.5,
    reviewCount: 19,
    pricing: {
      dailyRate: 11000,
      weeklyRate: 71500,
      monthlyRate: 285000,
      currency: 'THB'
    }
  },
  {
    id: 'dionysus-paradise-villa',
    name: 'Villa Dionysus Paradise',
    slug: 'dionysus-paradise-villa',
    description: 'Tropical paradise villa surrounded by lush vegetation and private gardens.',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    beachfront: false,
    location: 'Lamai, Koh Samui',
    images: [getHeroImage('dionysus')],
    amenities: ['Tropical Gardens', 'Private Pool', 'Peaceful Location', 'Nature Views'],
    featured: false,
    active: true,
    rating: 4.4,
    reviewCount: 15,
    pricing: {
      dailyRate: 9000,
      weeklyRate: 58500,
      monthlyRate: 230000,
      currency: 'THB'
    }
  },
  {
    id: 'hephaestus-craftsman-villa',
    name: 'Villa Hephaestus Craftsman',
    slug: 'hephaestus-craftsman-villa',
    description: 'Artisan-crafted villa with unique architectural details and luxury amenities.',
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 6,
    beachfront: false,
    location: 'Taling Ngam, Koh Samui',
    images: [getHeroImage('hephaestus')],
    amenities: ['Unique Design', 'Artisan Details', 'Private Pool', 'Craftsmanship'],
    featured: false,
    active: true,
    rating: 4.6,
    reviewCount: 22,
    pricing: {
      dailyRate: 13000,
      weeklyRate: 84500,
      monthlyRate: 335000,
      currency: 'THB'
    }
  },
  {
    id: 'demeter-nature-villa',
    name: 'Villa Demeter Nature',
    slug: 'demeter-nature-villa',
    description: 'Nature-inspired villa with organic design and eco-friendly features.',
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 6,
    beachfront: false,
    location: 'Nathon, Koh Samui',
    images: [getHeroImage('demeter')],
    amenities: ['Eco-Friendly', 'Natural Design', 'Private Pool', 'Organic Materials'],
    featured: false,
    active: true,
    rating: 4.3,
    reviewCount: 12,
    pricing: {
      dailyRate: 10000,
      weeklyRate: 65000,
      monthlyRate: 260000,
      currency: 'THB'
    }
  },
  {
    id: 'choengmon-beach-villa',
    name: 'Villa Choengmon Beach',
    slug: 'choengmon-beach-villa',
    description: 'Pristine beachfront villa with crystal clear waters and white sand beach.',
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 6,
    beachfront: true,
    location: 'Choeng Mon Beach, Koh Samui',
    images: [getHeroImage('choengmon')],
    amenities: ['Pristine Beach', 'Crystal Waters', 'Beach Villa', 'Water Sports'],
    featured: true,
    active: true,
    rating: 4.7,
    reviewCount: 28,
    pricing: {
      dailyRate: 16000,
      weeklyRate: 104000,
      monthlyRate: 415000,
      currency: 'THB'
    }
  },
  {
    id: 'darika-tropical-villa',
    name: 'Villa Darika Tropical',
    slug: 'darika-tropical-villa',
    description: 'Tropical retreat with authentic island charm and modern comforts.',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    beachfront: false,
    location: 'Maenam, Koh Samui',
    images: [getHeroImage('darika')],
    amenities: ['Tropical Design', 'Island Charm', 'Modern Comforts', 'Garden Views'],
    featured: false,
    active: true,
    rating: 4.2,
    reviewCount: 14,
    pricing: {
      dailyRate: 7500,
      weeklyRate: 48750,
      monthlyRate: 195000,
      currency: 'THB'
    }
  },
  {
    id: 'piotr-designer-villa',
    name: 'Villa Piotr Designer',
    slug: 'piotr-designer-villa',
    description: 'Designer villa with contemporary art and sophisticated interiors.',
    bedrooms: 4,
    bathrooms: 4,
    maxGuests: 8,
    beachfront: false,
    location: 'Bophut Hills, Koh Samui',
    images: [getHeroImage('piotr')],
    amenities: ['Designer Interiors', 'Contemporary Art', 'Sophisticated Design', 'Hill Views'],
    featured: false,
    active: true,
    rating: 4.6,
    reviewCount: 21,
    pricing: {
      dailyRate: 15000,
      weeklyRate: 97500,
      monthlyRate: 390000,
      currency: 'THB'
    }
  },
  {
    id: 'aphrodite-romance-villa',
    name: 'Villa Aphrodite Romance',
    slug: 'aphrodite-romance-villa',
    description: 'Romantic villa perfect for couples with intimate settings and beautiful views.',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    beachfront: false,
    location: 'Big Buddha, Koh Samui',
    images: ['/placeholder-villa.svg'], // Aphrodite folder is empty
    amenities: ['Romantic Setting', 'Intimate Design', 'Couple Retreat', 'Beautiful Views'],
    featured: false,
    active: true,
    rating: 4.4,
    reviewCount: 8,
    pricing: {
      dailyRate: 6000,
      weeklyRate: 39000,
      monthlyRate: 155000,
      currency: 'THB'
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = parseInt(searchParams.get('offset') || '0');
    const guests = searchParams.get('guests');
    const beachfront = searchParams.get('beachfront');
    const featured = searchParams.get('featured');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    
    let filteredVillas = [...COMPLETE_VILLA_DATABASE];
    
    // Filter by guest capacity
    if (guests) {
      const guestCount = parseInt(guests);
      filteredVillas = filteredVillas.filter(villa => villa.maxGuests >= guestCount);
    }
    
    // Filter by beachfront
    if (beachfront === 'true') {
      filteredVillas = filteredVillas.filter(villa => villa.beachfront === true);
    }
    
    // Filter by featured
    if (featured === 'true') {
      filteredVillas = filteredVillas.filter(villa => villa.featured === true);
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      const min = minPrice ? parseInt(minPrice) : 0;
      const max = maxPrice ? parseInt(maxPrice) : Infinity;
      filteredVillas = filteredVillas.filter(villa => 
        villa.pricing.dailyRate >= min && villa.pricing.dailyRate <= max
      );
    }
    
    // Sort by featured first, then by rating
    filteredVillas.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.rating - a.rating;
    });
    
    // Pagination
    const paginatedVillas = filteredVillas.slice(offset, offset + limit);
    
    return NextResponse.json({
      success: true,
      data: {
        villas: paginatedVillas,
        total: filteredVillas.length,
        hasMore: (offset + limit) < filteredVillas.length,
        pagination: {
          limit,
          offset,
          page: Math.floor(offset / limit) + 1,
          totalPages: Math.ceil(filteredVillas.length / limit)
        },
        filters: {
          guests: guests || null,
          beachfront: beachfront || null,
          featured: featured || null,
          priceRange: { min: minPrice || null, max: maxPrice || null }
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch villas',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}