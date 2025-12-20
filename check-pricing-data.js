require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Check what pricing data is currently in the database
 */

async function checkPricingData() {
  console.log('🔍 Checking Database Pricing Data\n');
  console.log('=' .repeat(70));

  try {
    // 1. Count total price rates
    const totalRates = await prisma.priceRate.count();
    console.log(`\n📊 Total Price Rates: ${totalRates}`);

    // 2. Count by villa
    const ratesByVilla = await prisma.priceRate.groupBy({
      by: ['villaId'],
      _count: true
    });
    console.log(`📍 Villas with pricing: ${ratesByVilla.length}`);

    // 3. Get detailed pricing for each villa
    console.log('\n' + '=' .repeat(70));
    console.log('\n📋 Detailed Pricing by Villa:\n');

    const villas = await prisma.villa.findMany({
      where: {
        priceRates: {
          some: {}
        }
      },
      include: {
        priceRates: {
          orderBy: {
            startDate: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    for (const villa of villas) {
      console.log(`\n🏠 ${villa.name}`);
      console.log(`   Slug: ${villa.slug}`);
      console.log(`   Bedrooms: ${villa.bedrooms}BR, Max Guests: ${villa.maxGuests}`);
      console.log(`   Price Rates: ${villa.priceRates.length}`);
      console.log('');

      // Group by season
      const seasons = {};
      villa.priceRates.forEach(rate => {
        const season = rate.seasonName || 'Unknown';
        if (!seasons[season]) {
          seasons[season] = [];
        }
        seasons[season].push(rate);
      });

      for (const [seasonName, rates] of Object.entries(seasons)) {
        const rate = rates[0]; // Take first rate as example
        const dateRange = `${rate.startDate.toISOString().split('T')[0]} → ${rate.endDate.toISOString().split('T')[0]}`;
        
        console.log(`   ${seasonName}:`);
        console.log(`      Price: ฿${rate.pricePerNight.toLocaleString()}/night`);
        console.log(`      Min Stay: ${rate.minStay || 'N/A'} nights`);
        console.log(`      Date Range: ${dateRange}`);
        console.log(`      Active: ${rate.active ? '✅' : '❌'}`);
      }
    }

    // 4. Check blocked dates
    console.log('\n' + '=' .repeat(70));
    console.log('\n📅 Blocked Dates:\n');

    const blockedCount = await prisma.blockedDate.count();
    console.log(`   Total Blocked Periods: ${blockedCount}`);

    if (blockedCount > 0) {
      const blockedByVilla = await prisma.blockedDate.groupBy({
        by: ['villaId', 'source'],
        _count: true
      });

      console.log('\n   By Villa & Source:');
      for (const block of blockedByVilla) {
        const villa = await prisma.villa.findUnique({
          where: { id: block.villaId },
          select: { name: true }
        });
        console.log(`      ${villa?.name}: ${block._count} periods (${block.source})`);
      }

      // Show recent blocked dates
      const recentBlocked = await prisma.blockedDate.findMany({
        where: {
          endDate: {
            gte: new Date()
          }
        },
        include: {
          villa: {
            select: {
              name: true,
              slug: true
            }
          }
        },
        orderBy: {
          startDate: 'asc'
        },
        take: 10
      });

      if (recentBlocked.length > 0) {
        console.log('\n   📌 Upcoming Blocked Periods (next 10):');
        recentBlocked.forEach(block => {
          const start = block.startDate.toISOString().split('T')[0];
          const end = block.endDate.toISOString().split('T')[0];
          console.log(`      ${block.villa.name}: ${start} → ${end}`);
          console.log(`         Reason: ${block.reason || 'N/A'}`);
          console.log(`         Source: ${block.source}`);
        });
      }
    }

    // 5. Summary statistics
    console.log('\n' + '=' .repeat(70));
    console.log('\n📈 Summary:\n');

    const priceStats = await prisma.priceRate.aggregate({
      _min: { pricePerNight: true },
      _max: { pricePerNight: true },
      _avg: { pricePerNight: true }
    });

    console.log(`   Price Range: ฿${priceStats._min.pricePerNight?.toLocaleString()} - ฿${priceStats._max.pricePerNight?.toLocaleString()}`);
    console.log(`   Average Price: ฿${Math.round(priceStats._avg.pricePerNight || 0).toLocaleString()}/night`);

    // Check date coverage
    const dateRangeStats = await prisma.priceRate.aggregate({
      _min: { startDate: true },
      _max: { endDate: true }
    });

    if (dateRangeStats._min.startDate && dateRangeStats._max.endDate) {
      console.log(`   Date Coverage: ${dateRangeStats._min.startDate.toISOString().split('T')[0]} → ${dateRangeStats._max.endDate.toISOString().split('T')[0]}`);
    }

    // 6. Check for gaps or issues
    console.log('\n' + '=' .repeat(70));
    console.log('\n🔍 Data Quality Checks:\n');

    const inactiveRates = await prisma.priceRate.count({
      where: { active: false }
    });
    console.log(`   Inactive Rates: ${inactiveRates}`);

    const ratesWithoutSeason = await prisma.priceRate.count({
      where: { seasonName: null }
    });
    console.log(`   Rates without Season: ${ratesWithoutSeason}`);

    const ratesWithoutMinStay = await prisma.priceRate.count({
      where: { minStay: null }
    });
    console.log(`   Rates without Min Stay: ${ratesWithoutMinStay}`);

    console.log('\n' + '=' .repeat(70));
    console.log('\n✅ Database check complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPricingData();
