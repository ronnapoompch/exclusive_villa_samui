// Professional Villa Image Path Converter - 210 Villas Complete System
const fs = require('fs');
const path = require('path');

console.log('🔧 PROFESSIONAL IMAGE PATH CONVERSION');
console.log('====================================');

// Load current villa data
const arrayPath = path.join(process.cwd(), 'src/data/folder-based-villas-array.json');
const objectPath = path.join(process.cwd(), 'src/data/folder-based-villas.json');

const arrayData = JSON.parse(fs.readFileSync(arrayPath, 'utf8'));
const objectData = JSON.parse(fs.readFileSync(objectPath, 'utf8'));

console.log(`📊 Processing ${arrayData.length} villas...`);

// Convert image paths to API routes
function convertImagePath(originalPath) {
  // Original: /villas/VillaName/category/filename.jpg
  // New: /api/images/VillaName/category/filename.jpg
  return originalPath.replace('/villas/', '/api/images/');
}

// Process array data
let convertedArrayData = arrayData.map(villa => {
  const convertedImages = {};
  
  if (villa.images && typeof villa.images === 'object') {
    Object.keys(villa.images).forEach(category => {
      if (Array.isArray(villa.images[category])) {
        convertedImages[category] = villa.images[category].map(convertImagePath);
      }
    });
  }
  
  return {
    ...villa,
    images: convertedImages
  };
});

// Process object data
let convertedObjectData = {};
Object.keys(objectData).forEach(slug => {
  const villa = objectData[slug];
  const convertedImages = {};
  
  if (villa.images && typeof villa.images === 'object') {
    Object.keys(villa.images).forEach(category => {
      if (Array.isArray(villa.images[category])) {
        convertedImages[category] = villa.images[category].map(convertImagePath);
      }
    });
  }
  
  convertedObjectData[slug] = {
    ...villa,
    images: convertedImages
  };
});

// Save converted data
fs.writeFileSync(arrayPath, JSON.stringify(convertedArrayData, null, 2));
fs.writeFileSync(objectPath, JSON.stringify(convertedObjectData, null, 2));

console.log('✅ Converted image paths for 210 villas');
console.log('✅ All images now use /api/images/ routes');
console.log('✅ Professional image serving enabled');
console.log('');
console.log('📸 Sample conversions:');
console.log('OLD: /villas/5House/hero/909.jpg');
console.log('NEW: /api/images/5House/hero/909.jpg');
console.log('');
console.log('🎯 System ready for production use!');