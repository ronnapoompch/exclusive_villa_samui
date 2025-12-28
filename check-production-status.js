// Check if production is ready for seeding
async function checkProduction() {
  const productionUrl = 'https://exclusive-villa-samui-ronnapoompch-4504-ronnapooms-projects.vercel.app';
  
  console.log('🔍 Checking production status...\n');
  
  try {
    // Check homepage
    console.log('1️⃣ Checking homepage...');
    const homeResponse = await fetch(productionUrl);
    console.log(`   Status: ${homeResponse.status} ${homeResponse.ok ? '✅' : '❌'}`);
    
    // Check API endpoint
    console.log('\n2️⃣ Checking villas API...');
    const apiResponse = await fetch(`${productionUrl}/api/villas?limit=1`);
    console.log(`   Status: ${apiResponse.status} ${apiResponse.ok ? '✅' : '❌'}`);
    
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      console.log(`   Response:`, data.success ? '✅ Success' : '❌ Failed');
      if (data.data && data.data.villas) {
        console.log(`   Villas in production: ${data.data.villas.length}`);
      }
    }
    
    // Check seed endpoint
    console.log('\n3️⃣ Checking seed API endpoint...');
    const seedResponse = await fetch(`${productionUrl}/api/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`   Status: ${seedResponse.status}`);
    
    if (seedResponse.status === 401) {
      console.log('   ✅ Endpoint exists (returns 401 Unauthorized as expected)');
      console.log('\n⚠️  Next step: You need to set SEED_SECRET in Vercel Dashboard');
      console.log('   👉 Go to: https://vercel.com/ronnapooms-projects/exclusive-villa-samui/settings/environment-variables');
      console.log('   👉 Add: SEED_SECRET = exclusive-villa-samui-seed-2024-secret-key');
      console.log('   👉 Then redeploy and run: node seed-production.js');
    } else if (seedResponse.status === 404) {
      console.log('   ❌ Endpoint not found - waiting for deployment...');
      console.log('   Please wait 2-3 minutes and try again');
    } else {
      const text = await seedResponse.text();
      console.log('   Response:', text.substring(0, 100));
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nℹ️  Production might still be deploying. Please wait a few minutes.');
  }
}

checkProduction();
