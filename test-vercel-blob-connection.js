/**
 * 🧪 Test Vercel Blob Connection
 * 
 * This script tests the connection to Vercel Blob storage
 * before attempting to upload all images.
 */

require('dotenv').config({ path: '.env.local' });
const { put, list } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Vercel Blob Connection...\n');

async function testConnection() {
  try {
    // 1. Check if token exists
    console.log('1️⃣ Checking BLOB_READ_WRITE_TOKEN...');
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN not found in .env.local');
    }
    console.log('   ✅ Token found\n');

    // 2. Test uploading a small test file
    console.log('2️⃣ Testing upload with a small test file...');
    const testContent = Buffer.from('Test upload from Exclusive Villa Samui');
    const testBlob = await put('test/connection-test.txt', testContent, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    console.log('   ✅ Upload successful!');
    console.log(`   📍 URL: ${testBlob.url}\n`);

    // 3. Test listing blobs
    console.log('3️⃣ Testing list operation...');
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      limit: 5,
    });
    console.log(`   ✅ Found ${blobs.length} blob(s) in storage\n`);

    // 4. Test with a real image if available
    console.log('4️⃣ Testing with a real image...');
    const sampleImagePath = path.join(__dirname, 'public', 'optimized-villas', '5-stars-beachfront-villa', 'hero', '909.webp');
    
    if (fs.existsSync(sampleImagePath)) {
      const imageBuffer = fs.readFileSync(sampleImagePath);
      const imageSize = (imageBuffer.length / 1024).toFixed(2);
      console.log(`   📸 Sample image size: ${imageSize} KB`);
      
      const imageBlob = await put('test/sample-villa-image.webp', imageBuffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: 'image/webp',
      });
      
      console.log('   ✅ Image upload successful!');
      console.log(`   📍 URL: ${imageBlob.url}\n`);
    } else {
      console.log('   ⚠️  Sample image not found, skipping image test\n');
    }

    // 5. Success summary
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log('🎉 Vercel Blob is ready to use!');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Run: node upload-to-vercel-blob.js');
    console.log('  2. Wait for upload to complete');
    console.log('  3. Verify images are accessible');
    console.log('');

  } catch (error) {
    console.error('\n❌ TEST FAILED!\n');
    console.error('Error details:', error.message);
    
    if (error.message.includes('token')) {
      console.error('\n📝 Solution:');
      console.error('   1. Check .env.local for BLOB_READ_WRITE_TOKEN');
      console.error('   2. Get a new token from: https://vercel.com/dashboard');
      console.error('   3. Go to Storage → Blob → Create Store');
    }
    
    process.exit(1);
  }
}

testConnection();
