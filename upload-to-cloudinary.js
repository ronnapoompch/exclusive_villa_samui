// Upload Villa Images to Cloudinary
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary (ใส่ค่าจาก Cloudinary Dashboard)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your_cloud_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your_api_secret'
});

const IMAGES_DIR = path.join(__dirname, 'public', 'optimized-data-images');
const BATCH_SIZE = 10; // Upload 10 images at a time
const DELAY_MS = 1000; // 1 second delay between batches

// Get all villa folders
function getVillaFolders() {
  return fs.readdirSync(IMAGES_DIR).filter(folder => {
    return fs.statSync(path.join(IMAGES_DIR, folder)).isDirectory();
  });
}

// Get all images in a villa folder
function getVillaImages(villaFolder) {
  const villaPath = path.join(IMAGES_DIR, villaFolder);
  const images = [];
  
  // Read all category folders (hero, ext, liv, etc.)
  const categories = fs.readdirSync(villaPath).filter(cat => {
    return fs.statSync(path.join(villaPath, cat)).isDirectory();
  });
  
  categories.forEach(category => {
    const categoryPath = path.join(villaPath, category);
    const files = fs.readdirSync(categoryPath);
    
    files.forEach(file => {
      if (file.match(/\.(jpg|jpeg|png|webp)$/i)) {
        images.push({
          villa: villaFolder,
          category: category,
          filename: file,
          localPath: path.join(categoryPath, file),
          publicId: `villas/${villaFolder}/${category}/${file.replace(/\.[^.]+$/, '')}`
        });
      }
    });
  });
  
  return images;
}

// Sanitize filename for Cloudinary
function sanitizePublicId(str) {
  return str
    .replace(/\s+/g, '-')  // Replace spaces with hyphens
    .replace(/&/g, 'and')  // Replace & with 'and'
    .replace(/[^\w\-\/]/g, '') // Remove special chars except word chars, hyphens, slashes
    .replace(/-+/g, '-')   // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Upload image to Cloudinary
async function uploadImage(imageInfo) {
  try {
    const sanitizedPublicId = sanitizePublicId(imageInfo.publicId);
    const result = await cloudinary.uploader.upload(imageInfo.localPath, {
      public_id: sanitizedPublicId,
      folder: 'exclusive-villa-samui',
      resource_type: 'image',
      overwrite: false, // Don't re-upload if exists
      invalidate: true,
      transformation: [
        { width: 1200, height: 900, crop: 'limit', quality: 'auto:good' }
      ]
    });
    
    console.log(`✅ Uploaded: ${imageInfo.villa}/${imageInfo.category}/${imageInfo.filename}`);
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error(`❌ Failed: ${imageInfo.villa}/${imageInfo.category}/${imageInfo.filename}`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Upload images in batches
async function uploadBatch(images, startIndex, batchSize) {
  const batch = images.slice(startIndex, startIndex + batchSize);
  const promises = batch.map(img => uploadImage(img));
  return await Promise.all(promises);
}

// Sleep function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main upload function
async function uploadAllImages() {
  console.log('🚀 Starting Cloudinary Upload...\n');
  
  // Get all villa folders
  const villaFolders = getVillaFolders();
  console.log(`📁 Found ${villaFolders.length} villa folders\n`);
  
  // Collect all images
  const allImages = [];
  villaFolders.forEach(villa => {
    const images = getVillaImages(villa);
    allImages.push(...images);
  });
  
  console.log(`📸 Total images to upload: ${allImages.length}\n`);
  console.log(`⏱️  Estimated time: ${Math.ceil(allImages.length / BATCH_SIZE * DELAY_MS / 1000 / 60)} minutes\n`);
  
  // Upload in batches
  let uploaded = 0;
  let failed = 0;
  const results = [];
  
  for (let i = 0; i < allImages.length; i += BATCH_SIZE) {
    const batchResults = await uploadBatch(allImages, i, BATCH_SIZE);
    results.push(...batchResults);
    
    uploaded += batchResults.filter(r => r.success).length;
    failed += batchResults.filter(r => !r.success).length;
    
    console.log(`\n📊 Progress: ${uploaded + failed}/${allImages.length} (${uploaded} success, ${failed} failed)`);
    
    // Wait before next batch
    if (i + BATCH_SIZE < allImages.length) {
      await sleep(DELAY_MS);
    }
  }
  
  // Save results
  const reportPath = path.join(__dirname, 'cloudinary-upload-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    total: allImages.length,
    uploaded: uploaded,
    failed: failed,
    results: results
  }, null, 2));
  
  console.log(`\n✅ Upload Complete!`);
  console.log(`📊 Total: ${allImages.length}`);
  console.log(`✅ Success: ${uploaded}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📄 Report saved to: ${reportPath}`);
}

// Run upload
if (require.main === module) {
  uploadAllImages().catch(console.error);
}

module.exports = { uploadAllImages };
