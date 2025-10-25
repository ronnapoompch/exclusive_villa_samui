// prisma/villa_seed.ts - Villa Data Seeding from CSV
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { parseVillaData, ParsedVilla } from '../utils/csvParser';

const prisma = new PrismaClient();

async function seedVillas() {
  console.log('🏖️  Starting villa data seeding from CSV...');

  try {
    // Parse CSV data
    const csvPath = path.join(process.cwd(), 'data', 'villa_data.csv');
    const villaData = parseVillaData(csvPath);
    
    console.log(`📊 Parsed ${villaData.length} villas from CSV`);

    let createdCount = 0;
    let skippedCount = 0;

    // Process each villa
    for (const villa of villaData) {
      try {
        // Check if villa already exists
        const existing = await prisma.villa.findUnique({
          where: { slug: villa.slug }
        });

        if (existing) {
          console.log(`⏭️  Skipping existing villa: ${villa.name}`);
          skippedCount++;
          continue;
        }

        // Create villa record
        const createdVilla = await prisma.villa.create({
          data: {
            name: villa.name,
            slug: villa.slug,
            description: `Luxury ${villa.bedrooms}-bedroom villa in ${villa.location}. ${villa.beachfront ? 'Beachfront property with direct beach access.' : 'Beautiful villa in prime location.'}`,
            bedrooms: villa.bedrooms,
            bathrooms: Math.max(villa.bedrooms, 2), // Estimate bathrooms
            maxGuests: villa.bedrooms * 2, // Estimate max guests
            beachfront: villa.beachfront,
            location: villa.location,
            locationLink: villa.locationLink,
            phone: villa.phone,
            officialWebsite: villa.officialWebsite,
            airbnbUrl: villa.airbnbUrl,
            agodaUrl: villa.agodaUrl,
            minimumStay: villa.minimumStay,
            petFriendly: villa.petFriendly,
            cleaning: villa.cleaning,
            cook: villa.cook,
            utilities: villa.utilities,
            amenities: villa.beachfront 
              ? ['Beach Access', 'Swimming Pool', 'Air Conditioning', 'WiFi', 'Kitchen']
              : ['Swimming Pool', 'Air Conditioning', 'WiFi', 'Kitchen'],
            images: [
              `/images/villas/${villa.slug}/hero.jpg`,
              `/images/villas/${villa.slug}/bedroom.jpg`,
              `/images/villas/${villa.slug}/pool.jpg`,
              `/images/villas/${villa.slug}/living.jpg`
            ],
            featured: villa.beachfront && villa.bedrooms >= 4,
          }
        });

        // Create pricing data
        if (villa.monthlyPricing.length > 0) {
          const pricingData = villa.monthlyPricing.map(pricing => ({
            villaId: createdVilla.id,
            month: pricing.month,
            dailyRate: pricing.dailyRate,
            weeklyRate: pricing.dailyRate ? pricing.dailyRate * 7 * 0.9 : undefined, // 10% weekly discount
            monthlyRate: pricing.monthlyRate,
            currency: 'THB',
          }));

          await prisma.villaPricing.createMany({
            data: pricingData,
            skipDuplicates: true,
          });
        }

        console.log(`✅ Created villa: ${villa.name} (${villa.location})`);
        createdCount++;

      } catch (error) {
        console.error(`❌ Error creating villa ${villa.name}:`, error);
        skippedCount++;
      }
    }

    console.log('\n🎉 Villa seeding completed!');
    console.log(`📊 RESULTS:`);
    console.log(`✅ Created: ${createdCount} villas`);
    console.log(`⏭️  Skipped: ${skippedCount} villas`);
    
    // Get some statistics
    const stats = await getVillaStats();
    console.log('\n📈 VILLA STATISTICS:');
    console.log(`🏖️  Beachfront villas: ${stats.beachfront}`);
    console.log(`🏠 Regular villas: ${stats.regular}`);
    console.log(`🛏️  Bedrooms: 1BR(${stats.bedrooms[1] || 0}), 2BR(${stats.bedrooms[2] || 0}), 3BR(${stats.bedrooms[3] || 0}), 4BR(${stats.bedrooms[4] || 0}), 5BR+(${stats.bedrooms[5] || 0})`);
    console.log(`📍 Locations: ${Object.entries(stats.locations).map(([loc, count]) => `${loc}(${count})`).join(', ')}`);

  } catch (error) {
    console.error('❌ Villa seeding failed:', error);
    throw error;
  }
}

async function getVillaStats() {
  const villas = await prisma.villa.findMany({
    select: {
      beachfront: true,
      bedrooms: true,
      location: true,
    }
  });

  const stats = {
    beachfront: villas.filter(v => v.beachfront).length,
    regular: villas.filter(v => !v.beachfront).length,
    bedrooms: {} as Record<number, number>,
    locations: {} as Record<string, number>,
  };

  villas.forEach(villa => {
    // Bedroom stats
    const bedroomKey = villa.bedrooms >= 5 ? 5 : villa.bedrooms;
    stats.bedrooms[bedroomKey] = (stats.bedrooms[bedroomKey] || 0) + 1;

    // Location stats
    stats.locations[villa.location] = (stats.locations[villa.location] || 0) + 1;
  });

  return stats;
}

// Main execution
async function main() {
  try {
    await seedVillas();
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
}

export { seedVillas };