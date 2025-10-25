// Update Villa JSON with Cloudinary URLs
// Converts local paths to Cloudinary URLs after upload

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

if (!CLOUD_NAME) {
  console.error('❌ CLOUDINARY_CLOUD_NAME not found in .env.local');
  process.exit(1);
}

// Convert local path to Cloudinary URL
function localToCloudinaryUrl(localPath) {
  if (!localPath || !localPath.startsWith('/optimized-villas/')) {
    return localPath; // Return unchanged if not a local path
  }
  
  // /optimized-villas/villa-slug/category/filename.webp
  // -> https://res.cloudinary.com/{cloud}/image/upload/exclusive-villa-samui/villas/villa-slug/category/filename.webp
  
  const pathParts = localPath.replace('/optimized-villas/', '').split('/');
  const villaSlug = pathParts[0];
  const category = pathParts[1];
  const filename = pathParts[2];
  
  // Remove extension and add .webp (Cloudinary uses webp)
  const filenameWithoutExt = filename.replace(/\.[^.]+$/, '');
  
  return `${BASE_URL}/exclusive-villa-samui/villas/${villaSlug}/${category}/${filenameWithoutExt}.webp`;
}

// Update villa object
function updateVillaUrls(villa) {
  // Update main image
  if (villa.image) {
    villa.image = localToCloudinaryUrl(villa.image);
  }
  
  // Update category arrays
  const categories = ['hero', 'ext', 'liv', 'bed1', 'bed2-5', 'bath1', 'bath2-5', 'kit', 'din', 'pool', 'amen', 'view'];
  
  categories.forEach(category => {
    if (villa[category] && Array.isArray(villa[category])) {
      villa[category] = villa[category].map(img => localToCloudinaryUrl(img));
    }
  });
  
  // Update gallery
  if (villa.gallery && Array.isArray(villa.gallery)) {
    villa.gallery = villa.gallery.map(img => localToCloudinaryUrl(img));
  }
  
  return villa;
}

// Main function
async function updateAllVillas() {
  console.log('\n🔄 Updating Villa JSON with Cloudinary URLs\n');
  console.log('═'.repeat(70));
  console.log(`Cloud Name: ${CLOUD_NAME}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log('═'.repeat(70));
  console.log('');
  
  // Read villas-optimized.json
  const villasPath = path.join(__dirname, 'data', 'villas-optimized.json');
  const bySlugPath = path.join(__dirname, 'data', 'villas-optimized-by-slug.json');
  
  if (!fs.existsSync(villasPath)) {
    console.error(`❌ File not found: ${villasPath}`);
    process.exit(1);
  }
  
  console.log(`📖 Reading: ${villasPath}`);
  const villas = JSON.parse(fs.readFileSync(villasPath, 'utf8'));
  console.log(`✅ Found ${villas.length} villas\n`);
  
  // Update each villa
  console.log('🔄 Updating URLs...\n');
  let totalImages = 0;
  
  const updatedVillas = villas.map((villa, index) => {
    const updated = updateVillaUrls(villa);
    const imageCount = updated.gallery ? updated.gallery.length : 0;
    totalImages += imageCount;
    
    if ((index + 1) % 50 === 0) {
      console.log(`   ✅ Processed ${index + 1}/${villas.length} villas...`);
    }
    
    return updated;
  });
  
  console.log(`✅ Processed all ${villas.length} villas\n`);
  
  // Create by-slug object
  const villasBySlug = {};
  updatedVillas.forEach(villa => {
    villasBySlug[villa.slug] = villa;
  });
  
  // Backup original files
  const backupPath = path.join(__dirname, 'data', 'backups');
  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const backupVillasPath = path.join(backupPath, `villas-optimized-${timestamp}.json`);
  const backupBySlugPath = path.join(backupPath, `villas-optimized-by-slug-${timestamp}.json`);
  
  if (fs.existsSync(villasPath)) {
    console.log(`📦 Backing up original files...`);
    fs.copyFileSync(villasPath, backupVillasPath);
    console.log(`   ✅ Backup: ${backupVillasPath}`);
  }
  
  if (fs.existsSync(bySlugPath)) {
    fs.copyFileSync(bySlugPath, backupBySlugPath);
    console.log(`   ✅ Backup: ${backupBySlugPath}\n`);
  }
  
  // Save updated files
  console.log('💾 Saving updated files...');
  fs.writeFileSync(villasPath, JSON.stringify(updatedVillas, null, 2));
  console.log(`   ✅ Saved: ${villasPath}`);
  
  fs.writeFileSync(bySlugPath, JSON.stringify(villasBySlug, null, 2));
  console.log(`   ✅ Saved: ${bySlugPath}\n`);
  
  // Statistics
  console.log('═'.repeat(70));
  console.log('✅ UPDATE COMPLETE!');
  console.log('═'.repeat(70));
  console.log(`\n📊 Statistics:`);
  console.log(`   Total Villas: ${updatedVillas.length}`);
  console.log(`   Total Images: ${totalImages}`);
  console.log(`   Avg Images/Villa: ${(totalImages / updatedVillas.length).toFixed(1)}`);
  console.log(`\n🔗 Sample URLs:`);
  
  // Show sample URLs
  const sampleVilla = updatedVillas[0];
  console.log(`   Villa: ${sampleVilla.name}`);
  console.log(`   Main Image: ${sampleVilla.image}`);
  if (sampleVilla.hero && sampleVilla.hero.length > 0) {
    console.log(`   Hero Image: ${sampleVilla.hero[0]}`);
  }
  
  console.log('\n' + '═'.repeat(70));
  console.log('🎉 Next Steps:');
  console.log('   1. Update frontend components to use villas-optimized.json');
  console.log('   2. Test images on: https://exclusive-villa-samui.vercel.app');
  console.log('   3. Deploy to production');
  console.log('═'.repeat(70));
  console.log('');
}

// Run update
if (require.main === module) {
  updateAllVillas().catch(error => {
    console.error('\n❌ Fatal Error:', error);
    process.exit(1);
  });
}

module.exports = { updateAllVillas };
