/**
 * 🧪 Test Upload Sample Villas to Vercel Blob
 * 
 * This script uploads images from 2-3 sample villas to test
 * the upload process before doing the full upload.
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Configuration
const LOCAL_IMAGE_DIR = path.join(__dirname, 'public', 'optimized-villas');
const TEST_VILLA_SLUGS = [
  '5-stars-beachfront-villa',
  'alicia-serenity-a28',
  'anzhu-serenity'
];

// Progress tracking
let stats = {
  uploaded: 0,
  failed: 0,
  skipped: 0,
  startTime: Date.now()
};

/**
 * Upload a single image to Vercel Blob
 */
async function uploadImage(imagePath, blobPath) {
  try {
    const fileBuffer = fs.readFileSync(imagePath);
    
    const blob = await put(blobPath, fileBuffer, {
      access: 'public',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: 'image/webp',
      cacheControlMaxAge: 31536000 // Cache for 1 year
    });
    
    return blob.url;
  } catch (error) {
    throw error;
  }
}

/**
 * Process images for a single villa
 */
async function processVilla(villa) {
  console.log(`\n🏡 ${villa.name}`);
  
  // Get all images for this villa from database
  const images = await prisma.villaImage.findMany({
    where: { villaId: villa.id },
    orderBy: { order: 'asc' }
  });
  
  console.log(`   📸 Total images: ${images.length}`);
  
  let uploadedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  
  for (const image of images) {
    try {
      // Check if already uploaded (URL starts with https://)
      if (image.url.startsWith('https://')) {
        console.log(`   ⏭️  Already uploaded: ${path.basename(image.url)}`);
        skippedCount++;
        stats.skipped++;
        continue;
      }
      
      // Construct local file path
      const localPath = path.join(__dirname, 'public', image.url);
      
      // Check if file exists
      if (!fs.existsSync(localPath)) {
        console.log(`   ❌ Not found: ${path.basename(image.url)}`);
        failedCount++;
        stats.failed++;
        continue;
      }
      
      // Construct blob path
      const blobPath = `villas/${villa.slug}/${image.category}/${path.basename(image.url)}`;
      
      // Upload to Vercel Blob
      const blobUrl = await uploadImage(localPath, blobPath);
      
      // Update database
      await prisma.villaImage.update({
        where: { id: image.id },
        data: { url: blobUrl }
      });
      
      console.log(`   ✅ ${path.basename(image.url)}`);
      uploadedCount++;
      stats.uploaded++;
      
    } catch (error) {
      console.error(`   ❌ Failed ${path.basename(image.url)}: ${error.message}`);
      failedCount++;
      stats.failed++;
    }
  }
  
  console.log(`   📊 Uploaded: ${uploadedCount} | Skipped: ${skippedCount} | Failed: ${failedCount}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🧪 Testing Upload with Sample Villas\n');
  console.log('=' .repeat(60));
  
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ Error: BLOB_READ_WRITE_TOKEN not found');
    process.exit(1);
  }
  
  try {
    // Get test villas
    const villas = await prisma.villa.findMany({
      where: {
        slug: { in: TEST_VILLA_SLUGS }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { villaImages: true }
        }
      }
    });
    
    console.log(`\n📊 Test villas: ${villas.length}`);
    const totalImages = villas.reduce((sum, v) => sum + v._count.villaImages, 0);
    console.log(`   Total images: ${totalImages}\n`);
    console.log('=' .repeat(60));
    
    // Process each villa
    for (let i = 0; i < villas.length; i++) {
      await processVilla(villas[i]);
    }
    
    // Summary
    const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(1);
    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST COMPLETE!\n');
    console.log('📊 Results:');
    console.log(`   ✅ Uploaded: ${stats.uploaded}`);
    console.log(`   ⚠️  Skipped: ${stats.skipped}`);
    console.log(`   ❌ Failed: ${stats.failed}`);
    console.log(`   ⏱️  Time: ${elapsed}s`);
    console.log('=' .repeat(60));
    
    if (stats.uploaded > 0 && stats.failed === 0) {
      console.log('\n🎉 SUCCESS! Ready to upload all villas.');
      console.log('   Run: node upload-to-vercel-blob.js\n');
    } else if (stats.failed > 0) {
      console.log('\n⚠️  Some uploads failed. Please check the errors above.\n');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
