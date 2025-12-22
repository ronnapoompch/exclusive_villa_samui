import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// Secret key for seed endpoint (set in Vercel env vars)
const SEED_SECRET = process.env.SEED_SECRET || 'change-this-secret-in-production';

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${SEED_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { villas } = body;

    if (!villas || !Array.isArray(villas)) {
      return NextResponse.json(
        { success: false, error: 'Invalid data format' },
        { status: 400 }
      );
    }

    console.log(`🚀 Starting seed of ${villas.length} villas...`);

    let imported = 0;
    let failed = 0;

    for (const villaData of villas) {
      try {
        // Check if villa exists
        const existing = await prisma.villa.findUnique({
          where: { slug: villaData.slug }
        });

        if (existing) {
          console.log(`⏭️  Skipping ${villaData.name} (already exists)`);
          continue;
        }

        // Extract images and pricing
        const images = villaData.villaImages || [];
        const pricing = villaData.pricing || [];

        // Create villa with relations
        await prisma.villa.create({
          data: {
            slug: villaData.slug,
            name: villaData.name,
            description: villaData.description,
            bedrooms: villaData.bedrooms,
            bathrooms: villaData.bathrooms,
            maxGuests: villaData.maxGuests,
            beachfront: villaData.beachfront,
            location: villaData.location,
            amenities: villaData.amenities || [],
            featured: villaData.featured || false,
            active: villaData.active !== false, // Default true
            villaImages: {
              create: images.map((img: any) => ({
                url: img.url,
                category: img.category,
                order: img.order,
                isHero: img.isHero || false,
                altText: img.altText || `${villaData.name} - ${img.category}`
              }))
            },
            pricing: {
              create: pricing.map((price: any) => ({
                dailyRate: price.dailyRate,
                weeklyRate: price.weeklyRate,
                monthlyRate: price.monthlyRate,
                currency: price.currency || 'USD',
                validFrom: price.validFrom ? new Date(price.validFrom) : new Date(),
                validTo: price.validTo ? new Date(price.validTo) : null
              }))
            }
          }
        });

        imported++;
        if (imported % 10 === 0) {
          console.log(`✅ Imported ${imported} villas...`);
        }

      } catch (error) {
        console.error(`❌ Failed to import ${villaData.name}:`, error);
        failed++;
      }
    }

    console.log(`\n✅ Seed complete!`);
    console.log(`   Imported: ${imported}`);
    console.log(`   Failed: ${failed}`);

    return NextResponse.json({
      success: true,
      data: {
        imported,
        failed,
        total: villas.length
      }
    });

  } catch (error) {
    console.error('Seed API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to seed data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
