// Quick Integration Test  
// Use built-in fetch (Node 18+)
const fetch = globalThis.fetch || require('node-fetch');

async function quickTest() {
  console.log('🚀 QUICK INTEGRATION TEST\n');
  
  const tests = [];
  
  // Test 1: Server Health
  try {
    console.log('1️⃣ Testing server health...');
    const response = await fetch('http://localhost:3000/api/health');
    if (response.ok) {
      console.log('   ✅ Server is running');
      tests.push({ name: 'Server Health', passed: true });
    } else {
      console.log('   ❌ Server health check failed');
      tests.push({ name: 'Server Health', passed: false });
    }
  } catch (error) {
    console.log('   ❌ Server connection failed:', error.message);
    tests.push({ name: 'Server Health', passed: false });
  }

  // Test 2: Villa API
  try {
    console.log('\n2️⃣ Testing villa API...');
    const response = await fetch('http://localhost:3000/api/villas');
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Villa API working - Found ${data.data?.length || 0} villas`);
      tests.push({ name: 'Villa API', passed: true });
    } else {
      console.log('   ❌ Villa API failed');
      tests.push({ name: 'Villa API', passed: false });
    }
  } catch (error) {
    console.log('   ❌ Villa API error:', error.message);
    tests.push({ name: 'Villa API', passed: false });
  }

  // Test 3: Authentication API
  try {
    console.log('\n3️⃣ Testing authentication API...');
    const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' })
    });
    
    if (response.ok) {
      console.log('   ✅ Auth API working');
      tests.push({ name: 'Auth API', passed: true });
    } else {
      console.log('   ❌ Auth API failed');
      tests.push({ name: 'Auth API', passed: false });
    }
  } catch (error) {
    console.log('   ❌ Auth API error:', error.message);
    tests.push({ name: 'Auth API', passed: false });
  }

  // Summary
  const passed = tests.filter(t => t.passed).length;
  const total = tests.length;
  const rate = ((passed / total) * 100).toFixed(1);
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 RESULTS: ${passed}/${total} tests passed (${rate}%)`);
  
  tests.forEach(test => {
    const status = test.passed ? '✅' : '❌';
    console.log(`   ${status} ${test.name}`);
  });
  
  if (rate >= 80) {
    console.log('\n🎉 System is working well!');
  } else {
    console.log('\n⚠️ System needs attention');
  }
  console.log('='.repeat(50));
}

quickTest();