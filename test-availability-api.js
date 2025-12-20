const http = require('http');

async function testAvailabilityAPI() {
  console.log('🧪 Testing Availability API\n');
  console.log('='.repeat(60));
  
  // Test 1: GET endpoint with real villa slug
  console.log('\n📍 Test 1: GET /api/villas/5-stars-beachfront-villa/availability');
  
  try {
    const getResponse = await fetch('http://localhost:3000/api/villas/5-stars-beachfront-villa/availability');
    const getData = await getResponse.json();
    
    console.log(`Status: ${getResponse.status} ${getResponse.statusText}`);
    console.log('Response:', JSON.stringify(getData, null, 2));
    
    if (getResponse.ok && getData.success) {
      console.log('✅ GET endpoint working!');
      console.log(`   Villa: ${getData.data.villaName}`);
      console.log(`   Booked dates: ${getData.data.bookedDates.length} days`);
      console.log(`   Total bookings: ${getData.data.totalBookings}`);
    } else {
      console.log('❌ GET endpoint failed');
    }
  } catch (error) {
    console.log('❌ GET request error:', error.message);
  }
  
  // Test 2: POST endpoint (check availability)
  console.log('\n📍 Test 2: POST /api/villas/5-stars-beachfront-villa/availability (Available dates)');
  
  try {
    const checkInDate = new Date('2025-11-01');
    const checkOutDate = new Date('2025-11-05');
    
    const postResponse = await fetch('http://localhost:3000/api/villas/5-stars-beachfront-villa/availability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
      })
    });
    
    const postData = await postResponse.json();
    
    console.log(`Status: ${postResponse.status} ${postResponse.statusText}`);
    console.log('Response:', JSON.stringify(postData, null, 2));
    
    if (postResponse.ok && postData.success) {
      console.log('✅ POST endpoint working!');
      console.log(`   Available: ${postData.available}`);
      if (!postData.available && postData.conflicts) {
        console.log(`   Conflicts: ${postData.conflicts.length} bookings`);
      }
    } else {
      console.log('❌ POST endpoint failed');
    }
  } catch (error) {
    console.log('❌ POST request error:', error.message);
  }
  
  // Test 3: POST with blocked dates (Christmas)
  console.log('\n📍 Test 3: POST /api/villas/5-stars-beachfront-villa/availability (Blocked dates - Christmas)');
  
  try {
    const checkInDate = new Date('2025-12-24');
    const checkOutDate = new Date('2025-12-26');
    
    const postResponse = await fetch('http://localhost:3000/api/villas/5-stars-beachfront-villa/availability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
      })
    });
    
    const postData = await postResponse.json();
    
    console.log(`Status: ${postResponse.status} ${postResponse.statusText}`);
    console.log('Response:', JSON.stringify(postData, null, 2));
    
    if (postResponse.ok && postData.success) {
      console.log('✅ POST endpoint working!');
      console.log(`   Available: ${postData.available} (should be false)`);
      if (!postData.available && postData.blocked) {
        console.log(`   Blocked periods: ${postData.blocked.length}`);
        postData.blocked.forEach(b => {
          console.log(`     - ${b.startDate} → ${b.endDate} (${b.reason || b.source})`);
        });
      }
    } else {
      console.log('❌ POST endpoint failed');
    }
  } catch (error) {
    console.log('❌ POST request error:', error.message);
  }
  
  // Test 4: Villa not found (404)
  console.log('\n📍 Test 4: GET /api/villas/non-existent-villa/availability');
  
  try {
    const notFoundResponse = await fetch('http://localhost:3000/api/villas/non-existent-villa/availability');
    const notFoundData = await notFoundResponse.json();
    
    console.log(`Status: ${notFoundResponse.status} ${notFoundResponse.statusText}`);
    console.log('Response:', JSON.stringify(notFoundData, null, 2));
    
    if (notFoundResponse.status === 404) {
      console.log('✅ 404 handling working correctly!');
    } else {
      console.log('❌ Expected 404, got', notFoundResponse.status);
    }
  } catch (error) {
    console.log('❌ 404 test error:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!');
}

// Run tests
testAvailabilityAPI().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
