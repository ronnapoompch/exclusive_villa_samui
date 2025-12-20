/**
 * Test Production Site - Verify Images Loading
 */

const PRODUCTION_URL = 'https://exclusive-villa-samui.vercel.app';

async function testProduction() {
  console.log('🔍 Testing Production Site...\n');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Home page
    console.log('\n1️⃣ Testing Home Page...');
    const homeResponse = await fetch(PRODUCTION_URL);
    console.log(`   Status: ${homeResponse.status} ${homeResponse.statusText}`);
    
    if (homeResponse.ok) {
      console.log('   ✅ Home page accessible');
    } else {
      console.log('   ❌ Home page error');
      return;
    }
    
    // Test 2: API endpoint
    console.log('\n2️⃣ Testing API Endpoint...');
    const apiResponse = await fetch(`${PRODUCTION_URL}/api/villas?limit=5`);
    console.log(`   Status: ${apiResponse.status} ${apiResponse.statusText}`);
    
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      console.log(`   ✅ API working - Found ${data.villas?.length || 0} villas`);
      
      if (data.villas && data.villas.length > 0) {
        const villa = data.villas[0];
        console.log(`\n   📸 Sample Villa: ${villa.name}`);
        console.log(`      Slug: ${villa.slug}`);
        
        if (villa.images && villa.images.length > 0) {
          console.log(`      Images: ${villa.images.length} found`);
          console.log(`      First Image: ${villa.images[0]}`);
          
          // Test image URL
          console.log('\n3️⃣ Testing Image URL...');
          const imageUrl = `${PRODUCTION_URL}${villa.images[0]}`;
          console.log(`   URL: ${imageUrl}`);
          
          const imageResponse = await fetch(imageUrl);
          console.log(`   Status: ${imageResponse.status} ${imageResponse.statusText}`);
          
          if (imageResponse.ok) {
            console.log('   ✅ Images loading successfully!');
            console.log(`   Content-Type: ${imageResponse.headers.get('content-type')}`);
          } else {
            console.log('   ❌ Image failed to load');
          }
          
          // Test villa detail page
          console.log('\n4️⃣ Testing Villa Detail Page...');
          const villaPageUrl = `${PRODUCTION_URL}/villa/${villa.slug}`;
          console.log(`   URL: ${villaPageUrl}`);
          
          const villaResponse = await fetch(villaPageUrl);
          console.log(`   Status: ${villaResponse.status} ${villaResponse.statusText}`);
          
          if (villaResponse.ok) {
            console.log('   ✅ Villa page accessible');
          } else {
            console.log('   ❌ Villa page error');
          }
        } else {
          console.log('      ⚠️  No images found in response');
        }
      }
    } else {
      console.log('   ❌ API error');
      const errorText = await apiResponse.text();
      console.log(`   Error: ${errorText.substring(0, 200)}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Production Test Complete!');
    console.log('\n🌐 Visit: ' + PRODUCTION_URL);
    
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
  }
}

testProduction().catch(console.error);
