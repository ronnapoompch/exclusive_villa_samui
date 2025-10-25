// Update Villa JSON with Cloudinary URLs
const fs = require('fs');
const path = require('path');

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'your_cloud_name';
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

// Convert local path to Cloudinary URL
function localToCloudinaryUrl(localPath) {
  if (!localPath || localPath.startsWith('http')) {
    return localPath; // Already a URL
  }
  
  // Extract villa/category/filename from path
  // Example: /api/images/villa-001/hero/image.jpg
  const match = localPath.match(/\/api\/images\/([^\/]+)\/([^\/]+)\/([^\/]+)/);
  
  if (match) {
    const [, villa, category, filename] = match;
    const fileWithoutExt = filename.replace(/\.[^.]+$/, '');
    return `${BASE_URL}/exclusive-villa-samui/villas/${villa}/${category}/${fileWithoutExt}.jpg`;
  }
  
  return localPath; // Return as-is if can't parse
}

// Update folder-based-villas.json
function updateVillasJson() {
  const jsonPath = path.join(__dirname, 'data', 'folder-based-villas.json');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  let updatedCount = 0;
  
  Object.keys(data).forEach(slug => {
    const villa = data[slug];
    
    // Update main image
    if (villa.image) {
      villa.image = localToCloudinaryUrl(villa.image);
      updatedCount++;
    }
    
    // Update gallery
    if (villa.gallery && Array.isArray(villa.gallery)) {
      villa.gallery = villa.gallery.map(img => {
        updatedCount++;
        return localToCloudinaryUrl(img);
      });
    }
    
    // Update category-specific images
    ['hero', 'ext', 'liv', 'bed', 'fac', 'din', 'oth'].forEach(category => {
      if (villa[category] && Array.isArray(villa[category])) {
        villa[category] = villa[category].map(img => {
          updatedCount++;
          return localToCloudinaryUrl(img);
        });
      }
    });
  });
  
  // Backup original
  const backupPath = jsonPath.replace('.json', '.backup.json');
  fs.copyFileSync(jsonPath, backupPath);
  console.log(`📋 Backup created: ${backupPath}`);
  
  // Save updated
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  console.log(`✅ Updated ${updatedCount} image URLs in folder-based-villas.json`);
}

// Update folder-based-villas-array.json
function updateVillasArrayJson() {
  const jsonPath = path.join(__dirname, 'data', 'folder-based-villas-array.json');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  let updatedCount = 0;
  
  data.forEach(villa => {
    // Update main image
    if (villa.image) {
      villa.image = localToCloudinaryUrl(villa.image);
      updatedCount++;
    }
    
    // Update gallery
    if (villa.gallery && Array.isArray(villa.gallery)) {
      villa.gallery = villa.gallery.map(img => {
        updatedCount++;
        return localToCloudinaryUrl(img);
      });
    }
    
    // Update category-specific images
    ['hero', 'ext', 'liv', 'bed', 'fac', 'din', 'oth'].forEach(category => {
      if (villa[category] && Array.isArray(villa[category])) {
        villa[category] = villa[category].map(img => {
          updatedCount++;
          return localToCloudinaryUrl(img);
        });
      }
    });
  });
  
  // Backup original
  const backupPath = jsonPath.replace('.json', '.backup.json');
  fs.copyFileSync(jsonPath, backupPath);
  console.log(`📋 Backup created: ${backupPath}`);
  
  // Save updated
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  console.log(`✅ Updated ${updatedCount} image URLs in folder-based-villas-array.json`);
}

// Main function
function updateAllUrls() {
  console.log(`🚀 Updating villa JSON with Cloudinary URLs...`);
  console.log(`☁️  Cloud Name: ${CLOUD_NAME}\n`);
  
  updateVillasJson();
  updateVillasArrayJson();
  
  console.log(`\n✅ All URLs updated successfully!`);
}

// Run update
if (require.main === module) {
  updateAllUrls();
}

module.exports = { updateAllUrls };
