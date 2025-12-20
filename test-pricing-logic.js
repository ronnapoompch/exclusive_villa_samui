require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Simulate Pricing API logic for testing
 * This tests the pricing calculation without needing the dev server
 */

async function calculatePricing(slug, checkIn, checkOut, guests) {
  const villa = await prisma.villa.findUnique({
    where: { slug },
    include: {
      priceRates: {
        where: {
          active: true,
          AND: [
            { startDate: { lte: new Date(checkOut) } },
            { endDate: { gte: new Date(checkIn) } }
          ]
        },
        orderBy: { startDate: 'asc' }
      }
    }
  });

  if (!villa) {
    return { error: 'Villa not found' };
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

  if (nights < 1) {
    return { error: 'Invalid date range' };
  }

  // Calculate daily breakdown
  const breakdown = [];
  let totalNightPrice = 0;
  let currentDate = new Date(checkInDate);

  for (let i = 0; i < nights; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Find applicable rate for this date
    const rate = villa.priceRates.find(r => {
      const rateStart = new Date(r.startDate);
      const rateEnd = new Date(r.endDate);
      return currentDate >= rateStart && currentDate <= rateEnd;
    });

    if (rate) {
      breakdown.push({
        date: dateStr,
        price: rate.pricePerNight,
        seasonName: rate.seasonName
      });
      totalNightPrice += rate.pricePerNight;
    } else {
      // No rate found - use base price or error
      breakdown.push({
        date: dateStr,
        price: 0,
        seasonName: 'No pricing'
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Calculate fees
  const cleaningFee = nights <= 3 ? 3000 : nights <= 7 ? 4000 : 5000;
  const serviceFee = Math.round(totalNightPrice * 0.05);
  const total = totalNightPrice + cleaningFee + serviceFee;

  // Get requirements
  const maxMinStay = Math.max(...villa.priceRates.map(r => r.minStay || 0));
  const warnings = [];
  if (maxMinStay > nights) {
    warnings.push(`Minimum ${maxMinStay} night(s) required for this period`);
  }

  return {
    villa: {
      name: villa.name,
      slug: villa.slug,
      bedrooms: villa.bedrooms,
      maxGuests: villa.maxGuests
    },
    pricing: {
      pricePerNight: Math.round(totalNightPrice / nights),
      totalNights: totalNightPrice,
      cleaningFee,
      serviceFee,
      total,
      breakdown
    },
    requirements: {
      minStay: maxMinStay,
      maxGuests: villa.maxGuests
    },
    warnings
  };
}

async function testPricing() {
  console.log('🧪 Testing Pricing Calculations\n');
  console.log('=' .repeat(70));

  const tests = [
    {
      name: '5 Stars Villa - Low Season (3 nights)',
      slug: '5-stars-beachfront-villa',
      checkIn: '2025-06-15',
      checkOut: '2025-06-18',
      guests: 4,
      expected: { pricePerNight: 20000, nights: 3 }
    },
    {
      name: '5 Stars Villa - High Season (5 nights)',
      slug: '5-stars-beachfront-villa',
      checkIn: '2025-11-10',
      checkOut: '2025-11-15',
      guests: 6,
      expected: { pricePerNight: 26000, nights: 5 }
    },
    {
      name: '5 Stars Villa - Peak Season (7 nights)',
      slug: '5-stars-beachfront-villa',
      checkIn: '2025-12-24',
      checkOut: '2025-12-31',
      guests: 8,
      expected: { pricePerNight: 40000, nights: 7 }
    },
    {
      name: 'Clay Haven (2BR) - Low Season (3 nights)',
      slug: 'the-clay-haven',
      checkIn: '2025-07-10',
      checkOut: '2025-07-13',
      guests: 2,
      expected: { pricePerNight: 8000, nights: 3 }
    },
    {
      name: 'Villa Solara (7BR) - Peak Season (10 nights)',
      slug: 'millennial-residence-villa-solara',
      checkIn: '2025-12-22',
      checkOut: '2026-01-01',
      guests: 12,
      expected: { pricePerNight: 60000, nights: 10 }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`\n📍 ${test.name}`);
    console.log(`   ${test.checkIn} → ${test.checkOut} (${test.guests} guests)`);

    try {
      const result = await calculatePricing(
        test.slug,
        test.checkIn,
        test.checkOut,
        test.guests
      );

      if (result.error) {
        console.log(`   ❌ Error: ${result.error}`);
        failed++;
        continue;
      }

      const { villa, pricing, requirements, warnings } = result;

      // Verify calculations
      const expectedTotal = (test.expected.pricePerNight * test.expected.nights);
      const cleaningFee = test.expected.nights <= 3 ? 3000 : test.expected.nights <= 7 ? 4000 : 5000;
      const serviceFee = Math.round(expectedTotal * 0.05);
      const expectedGrandTotal = expectedTotal + cleaningFee + serviceFee;

      const isCorrect = 
        pricing.pricePerNight === test.expected.pricePerNight &&
        pricing.totalNights === expectedTotal &&
        pricing.total === expectedGrandTotal;

      if (isCorrect) {
        console.log(`   ✅ PASS`);
        passed++;
      } else {
        console.log(`   ❌ FAIL: Calculation mismatch`);
        console.log(`      Expected: ฿${test.expected.pricePerNight.toLocaleString()}/night × ${test.expected.nights}`);
        console.log(`      Got:      ฿${pricing.pricePerNight.toLocaleString()}/night × ${pricing.breakdown.length}`);
        failed++;
        continue;
      }

      // Display results
      console.log(`   🏠 ${villa.name} (${villa.bedrooms}BR, max ${villa.maxGuests} guests)`);
      console.log(`   💰 Total: ฿${pricing.total.toLocaleString()}`);
      console.log(`   📊 Breakdown:`);
      console.log(`      Nightly:  ฿${pricing.pricePerNight.toLocaleString()} × ${pricing.breakdown.length} nights = ฿${pricing.totalNights.toLocaleString()}`);
      console.log(`      Cleaning: ฿${pricing.cleaningFee.toLocaleString()}`);
      console.log(`      Service:  ฿${pricing.serviceFee.toLocaleString()} (5%)`);
      
      if (requirements.minStay > 0) {
        console.log(`   📋 Min Stay: ${requirements.minStay} night(s)`);
      }

      if (warnings.length > 0) {
        console.log(`   ⚠️  ${warnings.join(', ')}`);
      }

      // Show season breakdown
      const seasons = [...new Set(pricing.breakdown.map(b => b.seasonName))];
      if (seasons.length > 0) {
        console.log(`   🌟 Season(s): ${seasons.join(', ')}`);
      }

    } catch (error) {
      console.log(`   ❌ Exception: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '=' .repeat(70));
  console.log('\n📊 Test Summary:');
  console.log(`   Total Tests: ${tests.length}`);
  console.log(`   Passed: ${passed} ✅`);
  console.log(`   Failed: ${failed} ❌`);
  console.log(`   Success Rate: ${Math.round((passed / tests.length) * 100)}%`);

  if (passed === tests.length) {
    console.log('\n🎉 All pricing calculations working correctly!');
    console.log('\n✅ Next Steps:');
    console.log('   1. ✅ PriceRate Model created');
    console.log('   2. ✅ Sample pricing data added');
    console.log('   3. ✅ Pricing calculations tested');
    console.log('   4. 🔄 Integrate into BookingForm.tsx');
    console.log('   5. 🔄 Setup automated sync (Vercel Cron)');
    console.log('   6. 🔄 Collect iCal URLs for remaining villas\n');
  } else {
    console.log('\n⚠️  Some tests failed - review pricing logic\n');
  }

  await prisma.$disconnect();
}

testPricing();
