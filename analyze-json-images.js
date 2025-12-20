const fs = require('fs');

console.log('🔍 Analyzing villa images from villas-optimized.json...\n');

const data = JSON.parse(fs.readFileSync('./data/villas-optimized.json', 'utf8'));

console.log(`📊 Total villas in JSON: ${data.length}\n`);

// Check image patterns
const imageAnalysis = {
  villasWithImages: 0,
  villasWithoutImages: 0,
  totalImages: 0,
  cloudinaryImages: 0,
  localImages: 0,
  brokenPatterns: 0,
  categories: {
    hero: 0,
    ext: 0,
    liv: 0,
    bed1: 0,
    'bed2-5': 0,
    bath1: 0,
    'bath2-5': 0,
    kit: 0,
    din: 0,
    pool: 0,
    amen: 0,
    view: 0,
    gallery: 0
  }
};

const imageCategories = Object.keys(imageAnalysis.categories);

data.forEach((villa, index) => {
  let villaHasImages = false;
  let villaImageCount = 0;

  imageCategories.forEach(cat => {
    if (villa[cat] && Array.isArray(villa[cat]) && villa[cat].length > 0) {
      villaHasImages = true;
      villaImageCount += villa[cat].length;
      imageAnalysis.categories[cat] += villa[cat].length;
      
      villa[cat].forEach(img => {
        imageAnalysis.totalImages++;
        if (img.includes('cloudinary.com')) {
          imageAnalysis.cloudinaryImages++;
        } else if (img.startsWith('/')) {
          imageAnalysis.localImages++;
        }
        
        if (img.includes('undefined') || img.includes('null') || !img) {
          imageAnalysis.brokenPatterns++;
        }
      });
    }
  });

  if (villaHasImages) {
    imageAnalysis.villasWithImages++;
    
    if (index < 5) {
      console.log(`✅ ${villa.name}`);
      console.log(`   Images: ${villaImageCount}`);
      console.log(`   First image: ${villa.hero?.[0] || villa.gallery?.[0] || 'NONE'}`);
      console.log('');
    }
  } else {
    imageAnalysis.villasWithoutImages++;
    if (index < 5) {
      console.log(`❌ ${villa.name} - NO IMAGES`);
      console.log('');
    }
  }
});

console.log('='.repeat(60));
console.log('\n📈 Image Analysis Summary:\n');
console.log(`Total villas: ${data.length}`);
console.log(`✅ Villas with images: ${imageAnalysis.villasWithImages} (${((imageAnalysis.villasWithImages/data.length)*100).toFixed(1)}%)`);
console.log(`❌ Villas without images: ${imageAnalysis.villasWithoutImages}`);
console.log(`\n📸 Total images: ${imageAnalysis.totalImages}`);
console.log(`☁️  Cloudinary URLs: ${imageAnalysis.cloudinaryImages} (${((imageAnalysis.cloudinaryImages/imageAnalysis.totalImages)*100).toFixed(1)}%)`);
console.log(`💻 Local paths: ${imageAnalysis.localImages}`);
console.log(`⚠️  Broken patterns: ${imageAnalysis.brokenPatterns}`);
console.log(`\n📁 Images by category:`);
Object.entries(imageAnalysis.categories).forEach(([cat, count]) => {
  if (count > 0) {
    console.log(`   ${cat.padEnd(10)}: ${count}`);
  }
});

console.log('\n✅ Analysis complete!');
