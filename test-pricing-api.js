/**
 * Test Pricing API endpoints
 * Tests GET and POST methods with various scenarios
 */

const BASE_URL = 'http://localhost:3000';

async function testPricingAPI() {
  console.log('🧪 Testing Pricing API\n');
  console.log('=' .repeat(60));

  const testCases = [
    {
      name: 'GET Price Range - 5 Stars Villa',
      method: 'GET',
      slug: '5-stars-beachfront-villa',
      url: '/api/villas/5-stars-beachfront-villa/pricing',
      expectedStatus: 200
    },
    {
      name: 'POST Low Season Booking (3 nights)',
      method: 'POST',
      slug: '5-stars-beachfront-villa',
      url: '/api/villas/5-stars-beachfront-villa/pricing',
      body: {
        checkIn: '2025-06-15',
        checkOut: '2025-06-18',
        guests: 4
      },
      expectedStatus: 200,
      expectedPrice: 20000 // Low season
    },
    {
      name: 'POST High Season Booking (3 nights)',
      method: 'POST',
      slug: '5-stars-beachfront-villa',
      url: '/api/villas/5-stars-beachfront-villa/pricing',
      body: {
        checkIn: '2025-11-15',
        checkOut: '2025-11-18',
        guests: 6
      },
      expectedStatus: 200,
      expectedPrice: 26000 // High season
    },
    {
      name: 'POST Peak Season Booking (7 nights - minimum stay)',
      method: 'POST',
      slug: '5-stars-beachfront-villa',
      url: '/api/villas/5-stars-beachfront-villa/pricing',
      body: {
        checkIn: '2025-12-24',
        checkOut: '2025-12-31',
        guests: 8
      },
      expectedStatus: 200,
      expectedPrice: 40000 // Peak season
    },
    {
      name: 'POST Peak Season - Too Short (should warn)',
      method: 'POST',
      slug: '5-stars-beachfront-villa',
      url: '/api/villas/5-stars-beachfront-villa/pricing',
      body: {
        checkIn: '2025-12-24',
        checkOut: '2025-12-27',
        guests: 4
      },
      expectedStatus: 200,
      expectWarning: true
    },
    {
      name: 'POST Small Villa - Low Season',
      method: 'POST',
      slug: 'the-clay-haven',
      url: '/api/villas/the-clay-haven/pricing',
      body: {
        checkIn: '2025-07-10',
        checkOut: '2025-07-13',
        guests: 2
      },
      expectedStatus: 200,
      expectedPrice: 8000 // 2BR low season
    },
    {
      name: 'POST Large Villa - Peak Season',
      method: 'POST',
      slug: 'millennial-residence-villa-solara',
      url: '/api/villas/millennial-residence-villa-solara/pricing',
      body: {
        checkIn: '2025-12-25',
        checkOut: '2026-01-01',
        guests: 12
      },
      expectedStatus: 200,
      expectedPrice: 60000 // 7BR peak season
    },
    {
      name: 'POST Invalid Date Format',
      method: 'POST',
      slug: '5-stars-beachfront-villa',
      url: '/api/villas/5-stars-beachfront-villa/pricing',
      body: {
        checkIn: 'invalid-date',
        checkOut: '2025-06-18',
        guests: 4
      },
      expectedStatus: 400
    },
    {
      name: 'POST Check-out Before Check-in',
      method: 'POST',
      slug: '5-stars-beachfront-villa',
      url: '/api/villas/5-stars-beachfront-villa/pricing',
      body: {
        checkIn: '2025-06-18',
        checkOut: '2025-06-15',
        guests: 4
      },
      expectedStatus: 400
    },
    {
      name: 'GET Non-existent Villa',
      method: 'GET',
      slug: 'fake-villa-slug',
      url: '/api/villas/fake-villa-slug/pricing',
      expectedStatus: 404
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of testCases) {
    console.log(`\n🔍 ${test.name}`);
    console.log(`   ${test.method} ${test.url}`);
    
    if (test.body) {
      console.log(`   Body: ${JSON.stringify(test.body)}`);
    }

    try {
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (test.body) {
        options.body = JSON.stringify(test.body);
      }

      const response = await fetch(`${BASE_URL}${test.url}`, options);
      const data = await response.json();

      // Check status
      if (response.status !== test.expectedStatus) {
        console.log(`   ❌ FAIL: Expected status ${test.expectedStatus}, got ${response.status}`);
        failed++;
        continue;
      }

      // For successful responses
      if (response.status === 200) {
        if (test.method === 'GET') {
          console.log(`   ✅ PASS`);
          console.log(`   📊 Price Range: ฿${data.priceRange?.min?.toLocaleString()} - ฿${data.priceRange?.max?.toLocaleString()}`);
          console.log(`   📅 Seasons: ${data.seasons?.length || 0}`);
        } else if (test.method === 'POST') {
          const pricing = data.pricing;
          console.log(`   ✅ PASS`);
          console.log(`   💰 Total: ฿${pricing.total.toLocaleString()}`);
          console.log(`   🛏️  Nightly: ฿${pricing.pricePerNight.toLocaleString()} × ${pricing.breakdown?.length || 0} nights = ฿${pricing.totalNights.toLocaleString()}`);
          console.log(`   🧹 Cleaning: ฿${pricing.cleaningFee.toLocaleString()}`);
          console.log(`   💼 Service (5%): ฿${pricing.serviceFee.toLocaleString()}`);
          
          if (data.requirements) {
            console.log(`   📋 Min Stay: ${data.requirements.minStay} night(s)`);
          }

          if (data.warnings && data.warnings.length > 0) {
            console.log(`   ⚠️  Warnings: ${data.warnings.join(', ')}`);
          }

          // Verify expected price
          if (test.expectedPrice && pricing.pricePerNight !== test.expectedPrice) {
            console.log(`   ⚠️  Expected ฿${test.expectedPrice}/night, got ฿${pricing.pricePerNight}/night`);
          }
        }
        passed++;
      } else {
        // Error responses
        console.log(`   ✅ PASS: Correctly returned error`);
        console.log(`   📝 Error: ${data.error}`);
        passed++;
      }

    } catch (error) {
      console.log(`   ❌ FAIL: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 Test Results:');
  console.log(`   Total: ${testCases.length}`);
  console.log(`   Passed: ${passed} ✅`);
  console.log(`   Failed: ${failed} ❌`);
  console.log(`   Success Rate: ${Math.round((passed / testCases.length) * 100)}%\n`);
}

// Check if dev server is running
fetch(`${BASE_URL}/api/villas/5-stars-beachfront-villa/pricing`)
  .then(() => testPricingAPI())
  .catch(() => {
    console.log('❌ Error: Development server not running');
    console.log('💡 Start it with: npm run dev');
    console.log('   Then run this test again\n');
  });
