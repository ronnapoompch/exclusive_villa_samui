require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Add sample pricing data for priority villas
 * This creates realistic seasonal pricing for testing
 */

const PRIORITY_VILLA_IDS = [
  'cmh6lasrc00005dmsxogue9l1', // 5 Stars beachfront Villa
  'cmh6lasrt00035dmsxbolc4nz', // Alicia Serenity A3
  'cmh6lasrr00025dmsztl26kvz', // Anzhu Serenity
  'cmh6lasu100215dmsv28p3fpd', // La Mirage
  'cmh6lasu000205dmsklg29r7a', // Kieren Villa Grace
  'cmh6lasxs004t5dms54yn1y0w', // The Wavora 1
  'cmh6lasuy002l5dms7cjac6lt', // Millennial Residence Villa Solara
  'cmh6lasyc005a5dmsue0ln4vl', // The Clay Haven
  'cmh6laszh00655dms1zwibzju'  // Zulu Vista A1
];

async function addSamplePricing() {
  console.log('📊 Adding Sample Pricing Data\n');
  console.log('=' .repeat(60));
  
  try {
    // Define pricing seasons for 2025-2026
    const pricingSeasons = [
      {
        name: 'Low Season',
        startDate: new Date('2025-05-01'),
        endDate: new Date('2025-10-31'),
        multiplier: 1.0, // Base price
        minStay: 2
      },
      {
        name: 'High Season',
        startDate: new Date('2025-11-01'),
        endDate: new Date('2025-12-19'),
        multiplier: 1.3,
        minStay: 3
      },
      {
        name: 'Peak Season (Christmas/New Year)',
        startDate: new Date('2025-12-20'),
        endDate: new Date('2026-01-10'),
        multiplier: 2.0,
        minStay: 7 // Minimum 7 nights during peak
      },
      {
        name: 'High Season',
        startDate: new Date('2026-01-11'),
        endDate: new Date('2026-04-30'),
        multiplier: 1.3,
        minStay: 3
      },
      {
        name: 'Low Season',
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-10-31'),
        multiplier: 1.0,
        minStay: 2
      },
      {
        name: 'High Season',
        startDate: new Date('2026-11-01'),
        endDate: new Date('2026-12-19'),
        multiplier: 1.3,
        minStay: 3
      },
      {
        name: 'Peak Season (Christmas/New Year)',
        startDate: new Date('2026-12-20'),
        endDate: new Date('2027-01-10'),
        multiplier: 2.0,
        minStay: 7
      }
    ];

    // Base prices per bedroom (THB per night)
    const basePrices = {
      2: 8000,   // 2BR villa
      3: 12000,  // 3BR villa
      4: 16000,  // 4BR villa
      5: 20000,  // 5BR villa
      6: 25000,  // 6BR villa
      7: 30000   // 7BR villa
    };

    let totalCreated = 0;
    let totalSkipped = 0;

    for (const villaId of PRIORITY_VILLA_IDS) {
      // Get villa info
      const villa = await prisma.villa.findUnique({
        where: { id: villaId },
        select: {
          name: true,
          bedrooms: true,
          slug: true
        }
      });

      if (!villa) {
        console.log(`❌ Villa not found: ${villaId}`);
        totalSkipped++;
        continue;
      }

      console.log(`\n📍 ${villa.name} (${villa.bedrooms} bedrooms)`);

      // Get base price for this villa size
      const basePrice = basePrices[villa.bedrooms] || basePrices[3];

      // Check if pricing already exists
      const existingPrices = await prisma.priceRate.count({
        where: { villaId, source: 'manual' }
      });

      if (existingPrices > 0) {
        console.log(`   ⚠️  Already has ${existingPrices} price rates, skipping`);
        totalSkipped++;
        continue;
      }

      // Create price rates for each season
      const priceRatesToCreate = pricingSeasons.map(season => ({
        villaId,
        startDate: season.startDate,
        endDate: season.endDate,
        pricePerNight: Math.round(basePrice * season.multiplier),
        currency: 'THB',
        minStay: season.minStay,
        maxStay: 30,
        seasonName: season.name,
        source: 'manual',
        active: true
      }));

      await prisma.priceRate.createMany({
        data: priceRatesToCreate
      });

      console.log(`   ✅ Created ${priceRatesToCreate.length} price rates`);
      priceRatesToCreate.forEach(rate => {
        const start = rate.startDate.toISOString().split('T')[0];
        const end = rate.endDate.toISOString().split('T')[0];
        console.log(`      ${rate.seasonName}: ฿${rate.pricePerNight.toLocaleString()}/night (${start} → ${end})`);
      });

      totalCreated += priceRatesToCreate.length;
    }

    console.log('\n' + '=' .repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   Villas processed: ${PRIORITY_VILLA_IDS.length}`);
    console.log(`   Price rates created: ${totalCreated}`);
    console.log(`   Villas skipped: ${totalSkipped}`);
    console.log('\n✅ Sample pricing data added successfully!');
    console.log('\n💡 Test the pricing API:');
    console.log('   GET  http://localhost:3000/api/villas/5-stars-beachfront-villa/pricing');
    console.log('   POST http://localhost:3000/api/villas/5-stars-beachfront-villa/pricing');
    console.log('   Body: {"checkIn":"2025-12-24","checkOut":"2025-12-27","guests":4}\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addSamplePricing();
