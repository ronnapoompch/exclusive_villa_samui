require('dotenv').config({ path: '.env.local' });
const https = require('https');

console.log('🔍 Testing Cloudinary image access...\n');

const testUrls = [
  'https://res.cloudinary.com/dkttxey0z/image/upload/exclusive-villa-samui/villas/5-stars-beachfront-villa/hero/909.webp',
  'https://res.cloudinary.com/dkttxey0z/image/upload/exclusive-villa-samui/villas/anzhu-serenity/hero/C1.webp',
  'https://res.cloudinary.com/dkttxey0z/image/upload/exclusive-villa-samui/villas/baan-luxy/hero/Baan_luxor_pics-22.webp'
];

async function testUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      const status = res.statusCode;
      const statusText = res.statusMessage;
      
      if (status === 200) {
        console.log(`✅ ${status} ${statusText}`);
        console.log(`   ${url}\n`);
      } else if (status === 401) {
        console.log(`❌ ${status} Unauthorized - Image is private or requires authentication`);
        console.log(`   ${url}\n`);
      } else if (status === 404) {
        console.log(`❌ ${status} Not Found - Image doesn't exist`);
        console.log(`   ${url}\n`);
      } else {
        console.log(`⚠️  ${status} ${statusText}`);
        console.log(`   ${url}\n`);
      }
      
      resolve(status);
    }).on('error', (err) => {
      console.log(`❌ Error: ${err.message}`);
      console.log(`   ${url}\n`);
      resolve(null);
    });
  });
}

async function runTests() {
  console.log('Testing 3 sample images from different villas:\n');
  
  const results = [];
  for (const url of testUrls) {
    const status = await testUrl(url);
    results.push(status);
  }
  
  console.log('='.repeat(60));
  console.log('\n📊 Summary:');
  const success = results.filter(s => s === 200).length;
  const unauthorized = results.filter(s => s === 401).length;
  const notFound = results.filter(s => s === 404).length;
  const errors = results.filter(s => s === null || (s !== 200 && s !== 401 && s !== 404)).length;
  
  console.log(`✅ Success (200): ${success}`);
  console.log(`❌ Unauthorized (401): ${unauthorized}`);
  console.log(`❌ Not Found (404): ${notFound}`);
  console.log(`⚠️  Other/Error: ${errors}`);
  
  if (unauthorized > 0) {
    console.log('\n⚠️  PROBLEM: Images are PRIVATE on Cloudinary');
    console.log('📝 Solutions:');
    console.log('   1. Make Cloudinary folder public in Cloudinary dashboard');
    console.log('   2. OR upload images with "type: upload" and "access_mode: public"');
    console.log('   3. OR use signed URLs (not recommended for public website)');
  }
  
  if (notFound > 0) {
    console.log('\n⚠️  PROBLEM: Images not found on Cloudinary');
    console.log('📝 Solution: Re-upload images to Cloudinary');
  }
  
  if (success === results.length) {
    console.log('\n✅ All images are accessible! No issues with Cloudinary.');
  }
}

runTests();
