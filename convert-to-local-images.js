const fs = require('fs');
const path = require('path');

console.log('🔄 Converting Cloudinary URLs to local paths...\n');

const jsonPath = path.join(__dirname, 'data', 'villas-optimized.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let updatedCount = 0;

// Function to convert Cloudinary URL to local path
function cloudinaryToLocal(url) {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }
  
  // Extract path after /villas/
  // From: https://res.cloudinary.com/dkttxey0z/image/upload/exclusive-villa-samui/villas/5-stars-beachfront-villa/hero/909.webp
  // To: /optimized-villas/5-stars-beachfront-villa/hero/909.webp
  
  const match = url.match(/villas\/([^\/]+)\/([^\/]+)\/([^\/]+)$/);
  if (match) {
    const [, villaSlug, category, filename] = match;
    return `/optimized-villas/${villaSlug}/${category}/${filename}`;
  }
  
  return url;
}

data.forEach(villa => {
  const categories = ['hero', 'ext', 'liv', 'bed1', 'bed2-5', 'bath1', 'bath2-5', 'kit', 'din', 'pool', 'amen', 'view', 'gallery'];
  
  categories.forEach(category => {
    if (villa[category] && Array.isArray(villa[category])) {
      villa[category] = villa[category].map(url => {
        const newUrl = cloudinaryToLocal(url);
        if (newUrl !== url) {
          updatedCount++;
        }
        return newUrl;
      });
    }
  });
});

// Backup original file
const backupPath = path.join(__dirname, 'data', 'backups', `villas-optimized-cloudinary-backup-${Date.now()}.json`);
fs.copyFileSync(jsonPath, backupPath);
console.log(`✅ Backed up to: ${path.basename(backupPath)}\n`);

// Save updated file
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

console.log(`✅ Updated ${updatedCount} image URLs`);
console.log(`✅ Converted from Cloudinary URLs to local paths`);
console.log(`✅ File saved: data/villas-optimized.json\n`);

// Show sample
console.log('📝 Sample villa after conversion:');
const sample = data[0];
console.log(`   Villa: ${sample.name}`);
console.log(`   Hero images: ${sample.hero?.length || 0}`);
if (sample.hero && sample.hero[0]) {
  console.log(`   First image: ${sample.hero[0]}`);
}
