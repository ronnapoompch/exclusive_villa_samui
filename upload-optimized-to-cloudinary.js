// Upload Optimized Villa Images to Cloudinary
// Professional version with progress tracking, retry logic, and comprehensive reporting

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verify configuration
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Missing Cloudinary credentials in .env.local');
  console.error('Please set: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
  process.exit(1);
}

const IMAGES_DIR = path.join(__dirname, 'public', 'optimized-villas');
const BATCH_SIZE = 5; // Upload 5 images at a time (to avoid rate limits)
const DELAY_MS = 500; // 500ms delay between batches
const MAX_RETRIES = 3; // Retry failed uploads

// Statistics
const stats = {
  total: 0,
  uploaded: 0,
  failed: 0,
  skipped: 0,
  startTime: Date.now(),
  villaStats: {}
};

// Get all villa folders
function getVillaFolders() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`❌ Directory not found: ${IMAGES_DIR}`);
    process.exit(1);
  }
  
  return fs.readdirSync(IMAGES_DIR).filter(folder => {
    const folderPath = path.join(IMAGES_DIR, folder);
    return fs.statSync(folderPath).isDirectory();
  });
}

// Get all images in a villa folder
function getVillaImages(villaFolder) {
  const villaPath = path.join(IMAGES_DIR, villaFolder);
  const images = [];
  
  // Read all category folders (hero, ext, liv, bed1, bed2-5, bath1, bath2-5, kit, din, pool, amen, view)
  const categories = fs.readdirSync(villaPath).filter(cat => {
    const catPath = path.join(villaPath, cat);
    return fs.statSync(catPath).isDirectory();
  });
  
  categories.forEach(category => {
    const categoryPath = path.join(villaPath, category);
    const files = fs.readdirSync(categoryPath);
    
    files.forEach(file => {
      if (file.match(/\.(webp|jpg|jpeg|png)$/i)) {
        images.push({
          villa: villaFolder,
          category: category,
          filename: file,
          localPath: path.join(categoryPath, file),
          publicId: `exclusive-villa-samui/villas/${villaFolder}/${category}/${file.replace(/\.[^.]+$/, '')}`
        });
      }
    });
  });
  
  return images;
}

// Sleep function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Upload single image with retry logic
async function uploadImage(imageInfo, retryCount = 0) {
  try {
    // Check if image already exists on Cloudinary
    try {
      await cloudinary.api.resource(imageInfo.publicId);
      console.log(`⏭️  Skipped (exists): ${imageInfo.villa}/${imageInfo.category}/${imageInfo.filename}`);
      stats.skipped++;
      return {
        success: true,
        skipped: true,
        url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${imageInfo.publicId}.webp`,
        publicId: imageInfo.publicId
      };
    } catch (notFoundError) {
      // Image doesn't exist, proceed with upload
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(imageInfo.localPath, {
      public_id: imageInfo.publicId,
      resource_type: 'image',
      overwrite: false,
      invalidate: true,
      format: 'webp', // Ensure WebP format
      transformation: [
        { 
          quality: 'auto:good',
          fetch_format: 'auto'
        }
      ]
    });
    
    console.log(`✅ Uploaded: ${imageInfo.villa}/${imageInfo.category}/${imageInfo.filename}`);
    stats.uploaded++;
    
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      bytes: result.bytes,
      format: result.format
    };
    
  } catch (error) {
    // Retry logic
    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 Retry ${retryCount + 1}/${MAX_RETRIES}: ${imageInfo.villa}/${imageInfo.category}/${imageInfo.filename}`);
      await sleep(1000 * (retryCount + 1)); // Exponential backoff
      return uploadImage(imageInfo, retryCount + 1);
    }
    
    console.error(`❌ Failed (${retryCount + 1} attempts): ${imageInfo.villa}/${imageInfo.category}/${imageInfo.filename}`, error.message);
    stats.failed++;
    
    return {
      success: false,
      error: error.message,
      villa: imageInfo.villa,
      category: imageInfo.category,
      filename: imageInfo.filename
    };
  }
}

// Upload batch of images
async function uploadBatch(images, startIndex, batchSize) {
  const batch = images.slice(startIndex, startIndex + batchSize);
  const promises = batch.map(img => uploadImage(img));
  return await Promise.all(promises);
}

// Format time
function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

// Main upload function
async function uploadAllImages() {
  console.log('\n🚀 Starting Cloudinary Upload for Optimized Villa Images\n');
  console.log('═'.repeat(70));
  console.log(`Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`Source Directory: ${IMAGES_DIR}`);
  console.log(`Batch Size: ${BATCH_SIZE} images`);
  console.log(`Delay: ${DELAY_MS}ms between batches`);
  console.log('═'.repeat(70));
  console.log('');
  
  // Get all villa folders
  const villaFolders = getVillaFolders();
  console.log(`📁 Found ${villaFolders.length} villa folders\n`);
  
  // Collect all images
  const allImages = [];
  villaFolders.forEach(villa => {
    const images = getVillaImages(villa);
    allImages.push(...images);
    stats.villaStats[villa] = {
      total: images.length,
      uploaded: 0,
      failed: 0,
      skipped: 0
    };
  });
  
  stats.total = allImages.length;
  
  console.log(`📸 Total images to upload: ${allImages.length}`);
  console.log(`⏱️  Estimated time: ${Math.ceil(allImages.length / BATCH_SIZE * DELAY_MS / 1000 / 60)} minutes\n`);
  console.log('═'.repeat(70));
  console.log('\n🔄 Starting upload...\n');
  
  // Upload in batches
  const results = [];
  const failedImages = [];
  
  for (let i = 0; i < allImages.length; i += BATCH_SIZE) {
    const batchResults = await uploadBatch(allImages, i, BATCH_SIZE);
    results.push(...batchResults);
    
    // Update villa stats
    batchResults.forEach((result, index) => {
      const img = allImages[i + index];
      if (result.success) {
        if (result.skipped) {
          stats.villaStats[img.villa].skipped++;
        } else {
          stats.villaStats[img.villa].uploaded++;
        }
      } else {
        stats.villaStats[img.villa].failed++;
        failedImages.push({ ...img, error: result.error });
      }
    });
    
    // Calculate progress
    const processed = i + batchResults.length;
    const percentage = ((processed / allImages.length) * 100).toFixed(1);
    const elapsed = Date.now() - stats.startTime;
    const avgTimePerImage = elapsed / processed;
    const remaining = (allImages.length - processed) * avgTimePerImage;
    
    console.log(`\n📊 Progress: ${processed}/${allImages.length} (${percentage}%)`);
    console.log(`   ✅ Uploaded: ${stats.uploaded} | ⏭️  Skipped: ${stats.skipped} | ❌ Failed: ${stats.failed}`);
    console.log(`   ⏱️  Elapsed: ${formatTime(elapsed)} | Remaining: ${formatTime(remaining)}`);
    
    // Wait before next batch (except for last batch)
    if (i + BATCH_SIZE < allImages.length) {
      await sleep(DELAY_MS);
    }
  }
  
  // Final statistics
  const totalTime = Date.now() - stats.startTime;
  
  console.log('\n' + '═'.repeat(70));
  console.log('✅ UPLOAD COMPLETE!');
  console.log('═'.repeat(70));
  console.log(`\n📊 Final Statistics:`);
  console.log(`   Total Images: ${stats.total}`);
  console.log(`   ✅ Uploaded: ${stats.uploaded}`);
  console.log(`   ⏭️  Skipped (exists): ${stats.skipped}`);
  console.log(`   ❌ Failed: ${stats.failed}`);
  console.log(`   ⏱️  Total Time: ${formatTime(totalTime)}`);
  console.log(`   📈 Upload Speed: ${(stats.uploaded / (totalTime / 1000)).toFixed(2)} images/sec\n`);
  
  // Save comprehensive report
  const reportPath = path.join(__dirname, 'cloudinary-upload-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    summary: {
      total: stats.total,
      uploaded: stats.uploaded,
      skipped: stats.skipped,
      failed: stats.failed,
      totalTimeMs: totalTime,
      totalTime: formatTime(totalTime)
    },
    villaStats: stats.villaStats,
    failedImages: failedImages,
    results: results
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Detailed report saved to: ${reportPath}\n`);
  
  // Show failed images if any
  if (failedImages.length > 0) {
    console.log('⚠️  Failed Images:');
    failedImages.forEach(img => {
      console.log(`   ❌ ${img.villa}/${img.category}/${img.filename} - ${img.error}`);
    });
    console.log('');
  }
  
  // Show top 10 villas by image count
  const sortedVillas = Object.entries(stats.villaStats)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10);
  
  console.log('🏆 Top 10 Villas by Image Count:');
  sortedVillas.forEach(([villa, stats], index) => {
    console.log(`   ${index + 1}. ${villa}: ${stats.total} images (✅${stats.uploaded} ⏭️${stats.skipped} ❌${stats.failed})`);
  });
  console.log('');
  
  console.log('═'.repeat(70));
  console.log('🎉 Next Steps:');
  console.log('   1. Run: node update-villa-cloudinary-urls.js');
  console.log('   2. Test images on: https://exclusive-villa-samui.vercel.app');
  console.log('   3. Check report: cloudinary-upload-report.json');
  console.log('═'.repeat(70));
  console.log('');
}

// Run upload
if (require.main === module) {
  uploadAllImages().catch(error => {
    console.error('\n❌ Fatal Error:', error);
    process.exit(1);
  });
}

module.exports = { uploadAllImages };
