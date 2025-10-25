// Simple API Test
const fetch = require('node-fetch');

async function testAPI() {
  console.log('🧪 Simple API Test Starting...\n');
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await fetch('http://localhost:3000/api/health');
    console.log(`   Status: ${healthResponse.status}`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('   ✅ Health check passed');
      console.log('   Data:', JSON.stringify(healthData, null, 2));
    } else {
      console.log('   ❌ Health check failed');
    }
    
  } catch (error) {
    console.log('   ❌ Connection error:', error.message);
  }
  
  try {
    // Test 2: Villa API
    console.log('\n2️⃣ Testing Villa API...');
    const villaResponse = await fetch('http://localhost:3000/api/villas');
    console.log(`   Status: ${villaResponse.status}`);
    
    if (villaResponse.ok) {
      const villaData = await villaResponse.json();
      console.log('   ✅ Villa API working');
      console.log(`   Found ${villaData.data ? villaData.data.length : 'unknown'} villas`);
    } else {
      console.log('   ❌ Villa API failed');
      const errorText = await villaResponse.text();
      console.log('   Error:', errorText.substring(0, 200));
    }
    
  } catch (error) {
    console.log('   ❌ Connection error:', error.message);
  }
  
  try {
    // Test 3: Forgot Password
    console.log('\n3️⃣ Testing Forgot Password API...');
    const forgotResponse = await fetch('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com'
      })
    });
    
    console.log(`   Status: ${forgotResponse.status}`);
    
    if (forgotResponse.ok) {
      const forgotData = await forgotResponse.json();
      console.log('   ✅ Forgot password API working');
      console.log('   Response:', forgotData.message);
    } else {
      console.log('   ❌ Forgot password API failed');
    }
    
  } catch (error) {
    console.log('   ❌ Connection error:', error.message);
  }
  
  console.log('\n✅ Simple API Test Complete!');
}

testAPI();