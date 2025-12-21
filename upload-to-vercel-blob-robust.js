/**
 * 📦 Upload to Vercel Blob - Robust Version
 * 
 * This script uploads villa images with better error handling,
 * slower pace to avoid rate limits, and ability to resume.
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Configuration - Conservative settings
const BATCH_SIZE = 5; // Smaller batches
const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds
const DELAY_BETWEEN_VILLAS = 3000; // 3 seconds
const MAX_RETRIES = 2;

// Progress tracking
let stats = {
  total: 0,
  uploaded: 0,
  failed: 0,
  skipped: 0,
  startTime: Date.now()
};

/**
 * Sleep function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Upload a single image with retry
 */
async function uploadImage(imagePath, blobPath, retries = 0) {
  try {
    const fileBuffer = fs.readFileSync(imagePath);
    
    const blob = await put(blobPath, fileBuffer, {
      access: 'public',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: 'image/webp',
      cacheControlMaxAge: 31536000,
      allowOverwrite: true
    });
    
    return blob.url;
  } catch (error) {
    if (retries < MAX_RETRIES && error.message.includes('rate')) {
      console.log(`   ⏸️  Rate limit, waiting 5s...`);
      await sleep(5000);
      return uploadImage(imagePath, blobPath, retries + 1);
    }
    throw error;
  }
}

/**
 * Process images for a single villa
 */
async function processVilla(villa, villaIndex, totalVillas) {
  console.log(`\n[${villaIndex + 1}/${totalVillas}] 🏡 ${villa.name}`);
  
  try {
    // Get all images for this villa
    const images = await prisma.villaImage.findMany({
      where: { villaId: villa.id },
      orderBy: { order: 'asc' }
    });
    
    if (images.length === 0) {
      console.log(`   ⏭️  No images found`);
      return { uploaded: 0, failed: 0, skipped: 0 };
    }
    
    console.log(`   📸 ${images.length} images`);
    
    let uploadedCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    
    // Process in small batches
    for (let i = 0; i < images.length; i += BATCH_SIZE) {
      const batch = images.slice(i, i + BATCH_SIZE);
      
      for (const image of batch) {
        try {
          // Skip if already uploaded
          if (image.url.startsWith('https://')) {
            skippedCount++;
            stats.skipped++;
            continue;
          }
          
          // Construct paths
          const localPath = path.join(__dirname, 'public', image.url);
          
          if (!fs.existsSync(localPath)) {
            console.log(`   ❌ Not found: ${path.basename(image.url)}`);
            failedCount++;
            stats.failed++;
            continue;
          }
          
          const blobPath = `villas/${villa.slug}/${image.category}/${path.basename(image.url)}`;
          
          // Upload
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
          console.error(`   ❌ ${path.basename(image.url)}: ${error.message.substring(0, 50)}`);
          failedCount++;
          stats.failed++;
        }
      }
      
      // Delay between batches
      if (i + BATCH_SIZE < images.length) {
        await sleep(DELAY_BETWEEN_BATCHES);
      }
    }
    
    console.log(`   📊 ✅ ${uploadedCount} | ⏭️  ${skippedCount} | ❌ ${failedCount}`);
    
    return { uploaded: uploadedCount, failed: failedCount, skipped: skippedCount };
    
  } catch (error) {
    console.error(`   💥 Error processing villa: ${error.message}`);
    return { uploaded: 0, failed: 0, skipped: 0 };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Vercel Blob Upload - Robust Version\n');
  console.log('⚙️  Settings:');
  console.log(`   • Batch Size: ${BATCH_SIZE} images`);
  console.log(`   • Delay between batches: ${DELAY_BETWEEN_BATCHES}ms`);
  console.log(`   • Delay between villas: ${DELAY_BETWEEN_VILLAS}ms\n`);
  console.log('=' .repeat(60));
  
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ BLOB_READ_WRITE_TOKEN not found!');
    process.exit(1);
  }
  
  try {
    // Get all villas
    const villas = await prisma.villa.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { villaImages: true } }
      },
      orderBy: { name: 'asc' }
    });
    
    stats.total = villas.reduce((sum, v) => sum + v._count.villaImages, 0);
    
    console.log(`\n📊 Found ${villas.length} villas with ${stats.total} images`);
    console.log(`⏱️  Estimated time: ~${Math.ceil(villas.length * 30 / 60)} minutes\n`);
    console.log('=' .repeat(60));
    
    // Process each villa
    for (let i = 0; i < villas.length; i++) {
      await processVilla(villas[i], i, villas.length);
      
      // Progress update
      const progress = ((i + 1) / villas.length * 100).toFixed(1);
      const elapsed = ((Date.now() - stats.startTime) / 1000 / 60).toFixed(1);
      console.log(`\n📈 Overall: ${progress}% | ${stats.uploaded} uploaded | ${stats.skipped} skipped | ${stats.failed} failed | ${elapsed}min`);
      
      // Delay between villas
      if (i < villas.length - 1) {
        await sleep(DELAY_BETWEEN_VILLAS);
      }
    }
    
    // Final summary
    const totalTime = ((Date.now() - stats.startTime) / 1000 / 60).toFixed(1);
    console.log('\n' + '='.repeat(60));
    console.log('🎉 UPLOAD COMPLETE!\n');
    console.log('📊 Final Results:');
    console.log(`   ✅ Uploaded: ${stats.uploaded}`);
    console.log(`   ⏭️  Skipped: ${stats.skipped}`);
    console.log(`   ❌ Failed: ${stats.failed}`);
    console.log(`   📦 Total: ${stats.total}`);
    console.log(`   ⏱️  Time: ${totalTime} minutes`);
    console.log('=' .repeat(60));
    
    if (stats.failed > 0) {
      console.log('\n⚠️  Some uploads failed. Run the script again to retry.');
    } else {
      console.log('\n✅ All images uploaded successfully!');
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle interruption
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Upload interrupted!');
  console.log(`📊 Progress: ${stats.uploaded} uploaded, ${stats.skipped} skipped, ${stats.failed} failed`);
  await prisma.$disconnect();
  process.exit(0);
});

// Run
main().catch(console.error);
