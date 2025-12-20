/**
 * 📦 Upload Local Images to Vercel Blob Storage
 * 
 * This script uploads all villa images from local storage to Vercel Blob
 * and updates the database with new Blob URLs.
 * 
 * Total: 7,056 images from 226 villas (~850MB)
 * 
 * Usage: node upload-to-vercel-blob.js
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Configuration
const LOCAL_IMAGE_DIR = path.join(__dirname, 'public', 'optimized-villas');
const BATCH_SIZE = 10; // Upload 10 images at a time to avoid rate limits
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Progress tracking
let stats = {
  total: 0,
  uploaded: 0,
  failed: 0,
  skipped: 0,
  startTime: Date.now()
};

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Upload a single image to Vercel Blob with retry logic
 */
async function uploadImage(imagePath, blobPath, retries = 0) {
  try {
    // Read file
    const fileBuffer = fs.readFileSync(imagePath);
    
    // Upload to Vercel Blob
    const blob = await put(blobPath, fileBuffer, {
      access: 'public',
      addRandomSuffix: false // Use exact path for predictable URLs
    });
    
    return blob.url;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.log(`⚠️  Retry ${retries + 1}/${MAX_RETRIES} for ${blobPath}`);
      await sleep(RETRY_DELAY * (retries + 1)); // Exponential backoff
      return uploadImage(imagePath, blobPath, retries + 1);
    }
    throw error;
  }
}

/**
 * Process images for a single villa
 */
async function processVilla(villa) {
  console.log(`\n🏡 Processing: ${villa.name} (${villa.slug})`);
  
  // Get all images for this villa from database
  const images = await prisma.villaImage.findMany({
    where: { villaId: villa.id },
    orderBy: { order: 'asc' }
  });
  
  if (images.length === 0) {
    console.log(`   ⚠️  No images found in database`);
    stats.skipped++;
    return;
  }
  
  console.log(`   📸 Found ${images.length} images`);
  
  let uploadedCount = 0;
  let failedCount = 0;
  
  // Process images in batches
  for (let i = 0; i < images.length; i += BATCH_SIZE) {
    const batch = images.slice(i, i + BATCH_SIZE);
    
    await Promise.all(
      batch.map(async (image) => {
        try {
          // Check if already uploaded (URL starts with https://)
          if (image.url.startsWith('https://')) {
            console.log(`   ✓ Already uploaded: ${path.basename(image.url)}`);
            stats.skipped++;
            return;
          }
          
          // Construct local file path
          const localPath = path.join(__dirname, 'public', image.url);
          
          // Check if file exists
          if (!fs.existsSync(localPath)) {
            console.log(`   ❌ File not found: ${image.url}`);
            stats.failed++;
            failedCount++;
            return;
          }
          
          // Construct blob path (remove /optimized-villas/ prefix)
          const blobPath = `villas/${villa.slug}/${image.category}/${path.basename(image.url)}`;
          
          // Upload to Vercel Blob
          const blobUrl = await uploadImage(localPath, blobPath);
          
          // Update database with new URL
          await prisma.villaImage.update({
            where: { id: image.id },
            data: { url: blobUrl }
          });
          
          console.log(`   ✅ Uploaded: ${path.basename(image.url)}`);
          stats.uploaded++;
          uploadedCount++;
          
        } catch (error) {
          console.error(`   ❌ Failed to upload ${image.url}:`, error.message);
          stats.failed++;
          failedCount++;
        }
      })
    );
    
    // Add delay between batches to avoid rate limits
    if (i + BATCH_SIZE < images.length) {
      await sleep(500); // 0.5 second delay
    }
  }
  
  console.log(`   📊 Result: ${uploadedCount} uploaded, ${failedCount} failed`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Vercel Blob Upload Script Started\n');
  console.log('=' .repeat(60));
  
  // Verify environment variable
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ Error: BLOB_READ_WRITE_TOKEN not found in .env.local');
    console.error('   Please add your Vercel Blob token first!');
    console.error('   Get it from: https://vercel.com/dashboard -> Storage -> Blob');
    process.exit(1);
  }
  
  // Verify local images directory exists
  if (!fs.existsSync(LOCAL_IMAGE_DIR)) {
    console.error(`❌ Error: Local image directory not found: ${LOCAL_IMAGE_DIR}`);
    process.exit(1);
  }
  
  try {
    // Get all villas with images
    const villas = await prisma.villa.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { villaImages: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    stats.total = villas.reduce((sum, v) => sum + v._count.villaImages, 0);
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total Villas: ${villas.length}`);
    console.log(`   Total Images: ${stats.total}`);
    console.log(`   Batch Size: ${BATCH_SIZE} images`);
    console.log(`   Estimated Time: ~${Math.ceil(stats.total / BATCH_SIZE * 0.5 / 60)} minutes\n`);
    console.log('=' .repeat(60));
    
    // Process each villa
    for (let i = 0; i < villas.length; i++) {
      const villa = villas[i];
      console.log(`\n[${i + 1}/${villas.length}]`);
      await processVilla(villa);
      
      // Show progress
      const progress = ((i + 1) / villas.length * 100).toFixed(1);
      const elapsed = ((Date.now() - stats.startTime) / 1000 / 60).toFixed(1);
      console.log(`   📈 Progress: ${progress}% | Elapsed: ${elapsed}min`);
    }
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Upload Complete!\n');
    console.log('📊 Final Statistics:');
    console.log(`   ✅ Successfully Uploaded: ${stats.uploaded}`);
    console.log(`   ⚠️  Skipped (already uploaded): ${stats.skipped}`);
    console.log(`   ❌ Failed: ${stats.failed}`);
    console.log(`   📦 Total: ${stats.total}`);
    
    const elapsedTime = ((Date.now() - stats.startTime) / 1000 / 60).toFixed(1);
    console.log(`   ⏱️  Total Time: ${elapsedTime} minutes`);
    
    const uploadRate = (stats.uploaded / (Date.now() - stats.startTime) * 60000).toFixed(1);
    console.log(`   🚀 Upload Rate: ${uploadRate} images/min`);
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main().catch(console.error);
