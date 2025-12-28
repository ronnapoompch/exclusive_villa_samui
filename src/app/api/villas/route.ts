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
    location: "Koh Samui",
    images: ["https://via.placeholder.com/800x600"],
    pricePerNight: 5000
  }
];

export async function GET() {
  return NextResponse.json(villas);
}
