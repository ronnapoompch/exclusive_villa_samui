import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const villas = [
  {
    id: "1",
    slug: "test-villa",
    name: "Test Villa",
    description: "Mock villa data",
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    beachfront: true,
    featured: true,
    location: "Koh Samui",
    images: ["https://via.placeholder.com/800x600?text=Test+Villa"],
    amenities: ["WiFi", "Pool", "Air Conditioning"],
    pricing: {
      dailyRate: "5000",
      currency: "THB"
    }
  }
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      villas: villas,
      pagination: {
        total: villas.length,
        limit: 1000,
        offset: 0,
        hasMore: false
      }
    }
  });
}
